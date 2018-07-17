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
This file contains a function that duplicates the input image
by using the storage client library's .copy method to upload
it to a different bucket.
 */

const StorageApi = require('@google-cloud/storage');
const storage = new StorageApi();
const helpers = require('../helpers');

/*
 * Create a copy of an image and upload the result to an
 * output bucket
 */
const copyImage = (file, parameters) => {
    /*
     * If no output bucket was specified, use the default
     * one for the entire pipeline.
     */
    const outputBucketName = parameters.outputBucketName ||
        process.env.OUTPUT_BUCKET;

    const outputFileName = helpers.createOutputFileName(
        file.name,
        parameters
    );

    const tempLocalInputFileName = helpers.createTempFileName(
        file.name
    );

    const tempLocalOutputFileName = helpers.createTempFileName(
        outputFileName
    );

    const outputFile = storage
        .bucket(outputBucketName)
        .file(outputFileName);

    /*
     * There is a case where this file object has
     * been constructed by a previous function but the
     * aata does not exist in GCS. Because of this we should
     * start by checking whether the file exists in storage, and
     * if it does we want to just copy it to the new bucket, but
     * if it doesn't we need to upload it. Either way we need
     * to guarantee that it exists in /tmp/ for the next function
     * to execute.
     */
    return file
        .exists()
        .then(([exists]) => {
            if (!exists) {
                return storage
                    .bucket(outputBucketName)
                    .upload(
                        tempLocalInputFileName,
                        {destination: outputFileName}
                    );
            }
            return file.copy(outputFile);
        })
        .then(() => outputFile.download({destination: tempLocalOutputFileName}))
        .then(() => outputFile)
        .catch(console.error);
};

copyImage.parameters = {
    outputBucketName: {
        defaultValue: null,
    },
    outputPrefix: {
        defaultValue: 'copied',
    },
};

module.exports = copyImage;
