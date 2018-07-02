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
const helpers = require('../helpers');
const storage = new StorageApi();
const fs = require('fs')

/*
Converts images between png, jpg, gif
 */

const convertRasterFormat = (file, parameters) => {
    const outputBucketName = parameters.outputBucketName
    const outputFileName = helpers.changeExtension(
        helpers.createOutputFileName(parameters.outputPrefix, file.name),
        parameters.extension.toLowerCase()
    )
    const tempLocalFileName = helpers.createTempFileName(file.name)
    const tempLocalOutputFileName = helpers.createTempFileName(outputFileName)
    return (
        // if the file has already been downloaded
        fs.existsSync(tempLocalFileName)
        // skip to the next step
        ? Promise.resolve()
        // otherwise, download it to the temp location
        : file.download({destination: tempLocalFileName})
    )
    // then, convert the file format
    .then(() => helpers.resolveImageMagickConvert([tempLocalFileName, tempLocalOutputFileName]))
    // write errors in the transform to the console
    .catch(console.error)
    .then(() =>
        // upload it to the desired output bucket    
        storage
            .bucket(outputBucketName)
            .upload(tempLocalOutputFileName, {destination: outputFileName})
            .then(() => storage.bucket(outputBucketName).file(outputFileName))
    )
}

convertRasterFormat.parameters = {
    outputBucketName: {
        defaultValue: 'cloud-maker-outputs-converted',
        validate: () => true,
    },
    outputPrefix: {
        defaultValue: 'converted',
        validate: () => true,
    },
    extension: {
        defaultValue: '.png',
        validate: (v) => ['.jpg', '.png', '.gif'].includes(v.toLowerCase()),
    },
}

module.exports = convertRasterFormat
