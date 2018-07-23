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

const StorageApi = require('@google-cloud/storage');
const helpers = require('./helpers');
const storage = new StorageApi();
const fs = require('fs');


// Many of the desired functions will require the same
// setup and teardown logic to interact with GCS and make sure
// that the image they work on is present on disk. This decorator
// extracts that into a single function for use in implementing
// others.

// Accepts a function transform that takes the infile, outfile and
// the input parameters and returns a function that can be called by
// the handler to execute that transform
const createImageMagickTransform = (transform) => {
    return (file, parameters) => {
        const outputFileName = helpers.createOutputFileName(
            file.name,
            parameters
        );
        const tempLocalFileName = helpers.createTempFileName(file.name);
        const tempLocalOutputFileName = helpers.createTempFileName(
            outputFileName
        );
        let download = Promise.resolve();
        if (!fs.existsSync(tempLocalFileName)) {
            download = file.download({destination: tempLocalFileName});
        }
        return download
            // apply the desired transform
            .then(() =>
                transform(
                    tempLocalFileName,
                    tempLocalOutputFileName,
                    parameters)
            )
            .then(() => {
                /*
                 * Use the global output bucket as the default
                 * place to store outputs. This file won't actually
                 * be uploaded unless this is the last function
                 * or the user specifies an output bucket for
                 * this function.
                 */

                return storage
                    .bucket(process.env.OUTPUT_BUCKET)
                    .upload(
                        tempLocalOutputFileName,
                        { destination: outputFileName }
                    )
                    .then(() => storage.bucket(process.env.OUTPUT_BUCKET).file(outputFileName))
                // const resultFile = storage
                //     .bucket(process.env.OUTPUT_BUCKET)
                //     .file(outputFileName);

                // if (parameters.outputBucketName) {
                //     // upload to the bucket specific to this function
                //     return storage
                //         .bucket(parameters.outputBucketName)
                //         .upload(
                //             tempLocalOutputFileName,
                //             {destination: outputFileName}
                //         )
                //         .then(() => resultFile);
                // }
                // return resultFile;
            }
            );
    };
};

module.exports = createImageMagickTransform;
