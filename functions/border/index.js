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
const helpers = require('../helpers')
const decorator = require('../decorator')

const applyBorder = (inFile, outFile, {color='blue', width='1'}) =>
    helpers.resolveImageMagickConvert([
        inFile,
        '-bordercolor',
        color.toLowerCase(),
        '-border',
        `${width}%x${width}%`,
        // write it out to the same local file
        outFile,
    ])

const transformApplyBorder = decorator(applyBorder)

transformApplyBorder.parameters = {
    outputPrefix: {
        defaultValue: 'bordered',
        validate: () => true,
    },
    outputBucketName: {
        defaultValue: 'cloud-maker-outputs-bordered',
        validate: () => true,
    },
    color: {
        defaultValue: 'blue',
        validate: (v) => ['blue', 'green', 'yellow', 'red'].includes(v.toLowerCase()),
    },
    width: {
        defaultValue: '1',
        validate: (v) =>
            // the input is a number
            !isNaN(v) &&
            // and is an integer
            Number.isInteger(Number(v)) &&
            // greater than 1
            Number(v) >= 1 &&
            // and less than 100
            Number(v) <= 100,
    },
    // different colors
    // different sizes
}

transformApplyBorder.applyBorder = applyBorder

module.exports = transformApplyBorder
