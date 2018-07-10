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

const googleColors = {
    blue: "#4285F4",
    green: "#34A853",
    yellow: "#fbbc04",
    red: "#EA4335",
}

const applyBorder = (inFile, outFile, {color='blue', width='1'}) => {
    return helpers.resolveImageMagickConvert([
        inFile,
        '-bordercolor',
        googleColors[color.toLowerCase()],
        '-border',
        `${width}%x${width}%`,
        outFile,
    ])
}

const transformApplyBorder = decorator(applyBorder)

transformApplyBorder.parameters = {
    outputPrefix: {
        defaultValue: 'bordered',
    },
    outputBucketName: {
        defaultValue: 'cloud-maker-outputs-bordered',
    },
    color: {
        defaultValue: 'blue',
        validate: (v) => ['blue', 'green', 'yellow', 'red'].includes(v.toLowerCase()),
    },
    width: {
        defaultValue: '1',
        validate: (v) =>
            !isNaN(v) &&
            Number.isInteger(Number(v)) &&
            Number(v) >= 1 &&
            Number(v) <= 100,
    },
}

transformApplyBorder.applyBorder = applyBorder

module.exports = transformApplyBorder
