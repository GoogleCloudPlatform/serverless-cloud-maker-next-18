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
Duplicates an image and uploads the result to the output bucket
 */

const StorageApi = require('@google-cloud/storage');

const storage = new StorageApi();

const createOutputFileName = (prefix = "", fileName) => 
    prefix
    ? `${prefix}-${path.parse(fileName).base}`
    : `${path.parse(fileName).base}.out`

const copyImage = (file, parameters) => {
    const outputBucketName = parameters.outputBucketName
    const outputFileName = createOutputFileName(parameters.outputPrefix, file.name)
    const outputFile = storage.bucket(outputBucketName).file(outputFileName)
    return file
        .copy(outputFile)
        .catch(console.error)
        .then(() => outputFile)
}

copyImage.parameters = {
    outputBucketName: {
        defaultValue: 'outputs-copied',
        validate: () => true,
    },
    outputPrefix: {
        defaultValue: 'copied',
        validate: () => true,
    },
}

module.exports = copyImage
