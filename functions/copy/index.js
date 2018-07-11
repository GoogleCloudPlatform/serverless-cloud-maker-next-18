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
    const outputBucketName = parameters.outputBucketName;
    const outputFileName = helpers.createOutputFileName(
        parameters.outputPrefix,
        file.name
    );

    const outputFile = storage
        .bucket(outputBucketName)
        .file(outputFileName);

    return file
        .copy(outputFile)
        .catch(console.error)
        .then(() => outputFile);
};

copyImage.parameters = {
    outputBucketName: {
        defaultValue: 'cloud-maker-outputs-copied',
    },
    outputPrefix: {
        defaultValue: 'copied',
    },
};

module.exports = copyImage;
