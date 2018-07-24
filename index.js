// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/*
 * This file contains the main handler function that
 * can be deployed as a service for the backend of the
 * showcase demo.
 */
const StorageApi = require('@google-cloud/storage');
const storage = new StorageApi();
const functions = require('./functions');
const fs = require('fs');

/*
 * Confirms that the "data" parameter of a request that specifies the input
 * file contains the required information. Should be of the form
 * {
 *      name,
 *      bucket
 *  }
 */
const validateData = (data) => {
    if (data.constructor == Array) {
        throw new Error('Data should be a single object, not an array');
    }

    if (!data.bucket) {
        throw new Error('No bucket specified');
    }

    if (!data.name) {
        throw new Error('No name specified');
    }

    return true;
};

/*
 * Confirms that the "parameters" passed to a function
 * are structured correctly and valid
 */
const validateParameters = (name, parameters={}) => {
    // grab the default values from the master dictionary
    const defaults = functions[name].parameters;
    // generate the set of acceptable parameters
    const defaultKeys = Object.keys(defaults);
    // generate the set of keys specified by the user
    const inputKeys = Object.keys(parameters);
    // by default, accept all values
    const defaultValidator = () => true;

    inputKeys.forEach(
        (key) => {
            if (defaultKeys.includes(key)) {
                const value = parameters[key];
                const validate = defaults[key].validate || defaultValidator;
                if (validate(value)) {
                    return;
                } else {
                    throw new Error(`Parameter ${key} with value ${value} was rejected by ${name}`);
                }
            } else {
                throw new Error(`Parameter ${key} not expected for function ${name}. Expected one of ${defaultKeys}`);
            }
        }
    );

    return true;
};

/*
 * Confirms that each entry of the "function" parameter of a request
 * specifies the name of a function that exists in this file
 */
const validateFunction = (func) => {
    if (!func.name) {
        throw new Error('No function name specified');
    }
    if (!functions[func.name]) {
        throw new Error(`No function exists with name ${func.name}`);
    }

    validateParameters(func.name, func.parameters);
    return true;
};

/*
 * HOTFIX: Hard coding one edge case for Sparks.
 */

const checkForBubblify = (request) => {
    if (request.body.functions.length != 3) {
        return;
    }
    if (request.body.functions[0].name != 'resizeTransform') {
        return;
    }
    if (request.body.functions[1].name != 'borderTransform') {
        return;
    }
    if (request.body.functions[2].name != 'cropShapeTransform') {
        return;
    }
    request.body.functions = [
        request.body.functions[0],
        request.body.functions[2],
        request.body.functions[1],
        request.body.functions[2],
    ];
    return;
};

/*
 * Confirms that the request is correctly structured
 */
const validateRequest = (request) => {
    console.log('Request', request.body);
    if (!request.body) {
        throw new Error('Invalid request: Missing body parameter.');
    }
    if (!request.body.data) {
        throw new Error('Invalid request: Missing input data.');
    }
    if (!request.body.functions) {
        throw new Error('Invalid request: Missing functions list.');
    }

    validateData(request.body.data);
    request.body.functions.map(validateFunction);
    checkForBubblify(request);

    return true;
};


const assignParameters = (name, parameters = {}) => {
    // initialize an empty result dictionary
    const result = {};

    // grab the defaul values from the master dictionary
    const defaults = functions[name].parameters;

    // generate the set of acceptable parameters
    const defaultKeys = Object.keys(defaults);

    // generate the set of keys specified by the user
    const inputKeys = Object.keys(parameters);

    // for each default key
    defaultKeys.forEach(
        (key) => {
            // set it as the default valud in the result dictionary
            result[key] = defaults[key].defaultValue;
        }
    );

    // for each of the keys that were
    inputKeys.forEach(
        (key) => {
            // because we have already validated in a previous
            // step, we can assume that the input is correct
            result[key] = parameters[key];
        }
    );

    return result;
};

const handler = (request, response) => {
    // first, make sure that
    // the request is valid
    try {
        // validate request data
        validateRequest(request);
    } catch (err) {
        // if the request is bad
        console.error(err);
        // send the error as the response
        response.status(400).send(err.message);
        // stop execution of the function
        return;
    }

    const outputBucketName = request.body.outputBucketName;

    /*
     * Attach to the process so that all functions can access
     * the eventual output bucket to use as a default
     */
    process.env.OUTPUT_BUCKET = outputBucketName;

    /*
     * Convert the json in the request to the objects
     * produced by the client library
     * (so that subroutines can download it)
     */
    const data = request.body.data;
    const file = storage.bucket(data.bucket).file(data.name);


    // Resolve when all functios have been completed
    return request
        .body
        .functions
        .reduce(
            // at each step of the reduction
            (accPromise, nextFunction) =>
                /*
                 * Each function needs the ability
                 * to resolve asynchronously, so we
                 * assume that result of the previous
                 * call was a promise.
                 */
                accPromise
                    .then(
                        // the promise will resolve with the accumulator
                        (acc) =>
                            // call the next functionn on the current image
                            functions[nextFunction.name](
                                acc,
                                assignParameters(
                                    nextFunction.name,
                                    nextFunction.parameters
                                )
                            )
                    )
            /*
             * To guarantee our assumption is correct,
             * convert the initial value to a promise resolution.
             */
            , Promise.resolve(file)
        )
        // Copy the final result to the output bucket
        .then(
            (resultFile) => {
                const tempFile = functions.helpers
                    .createTempFileName(resultFile.name);

                if (!fs.existsSync(tempFile)) {
                    /*
                     * In the case where the result of the last function
                     * is a file object from the storage api client library
                     * but has not been download into memory, just copy that
                     * object into the result bucket
                     * (the only case of this currently is safeSearch)
                     */
                    return resultFile.copy(storage.bucket(outputBucketName).file(resultFile.name));
                }
                return storage
                    .bucket(outputBucketName)
                    .upload(
                        functions.helpers.createTempFileName(resultFile.name),
                        {destination: resultFile.name}
                    );
            }
        )
        .then(([outputFile]) => response.send(outputFile))
        .catch((err) => {
            console.error(err);
            response
                .status(500)
                .send(err.message);
            return;
        });
};

/*
 * Additional endpoint to check that a
 * an image is safe to be sent through the showcase.
 * Returns true if the image is unsafe.
 */
const checkSafety = (request, response) => {
    const data = request.body.data;
    const file = storage.bucket(data.bucket).file(data.name);
    return functions
        .safeSearchTransform
        .checkSafety(file)
        .then((result) => response.send(result));
};

module.exports = {
    handler,
    checkSafety,
    functions,
    validateFunction,
    validateRequest,
    validateData,
    validateParameters,
    assignParameters,
};
