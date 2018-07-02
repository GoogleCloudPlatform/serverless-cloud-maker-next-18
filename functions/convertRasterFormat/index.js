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

const helpers = require('../helpers');
const decorator = require('../decorator')

/*
Converts images between png, jpg, gif
 */

const applyChangeFormat = (inFile, outFile, parameters) =>
    helpers.resolveImageMagickConvert([
        helpers.createTempFileName(inFile),
        helpers.createTempFileName(outFile),
    ])

const convertRasterFormat = decorator(applyChangeFormat);

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

convertRasterFormat.applyChangeFormat = applyChangeFormat

module.exports = convertRasterFormat
