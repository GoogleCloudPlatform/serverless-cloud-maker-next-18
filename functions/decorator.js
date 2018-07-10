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

const createImageMagickTransform = (transform) =>
     (file, parameters) => {
        const outputBucketName = parameters.outputBucketName
        const outputFileName = helpers.createOutputFileName(parameters.outputPrefix, file.name)
        const tempLocalFileName = helpers.createTempFileName(file.name)
        const tempLocalOutputFileName = helpers.createTempFileName(outputFileName)
        return (
            // if we have the file already
            fs.existsSync(tempLocalFileName)
                // skip
                ? Promise.resolve()
                // download it to that location
                : file.download({destination: tempLocalFileName})
        )
        // apply the desired transform
        .then(() => transform(tempLocalFileName, tempLocalOutputFileName, parameters))
        // write errors in the transform to the console
        .catch(console.error)
        .then(() =>
            // upload it to the desired output bucket
            storage
                .bucket(outputBucketName)
                .upload(tempLocalOutputFileName, {destination: outputFileName})
                // resolve with the file object created by that upload
                .then(() => storage.bucket(outputBucketName).file(outputFileName))
        )
    }


module.exports = createImageMagickTransform