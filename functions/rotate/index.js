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
const helpers = require("../helpers")
const decorator = require("../decorator")


// defines a function that rotates an image
// by a specified number of degrees

// define a function with the signature expected
// by the decorator
const applyRotate = (inFile, outFile, {degrees}) =>
    helpers.resolveImageMagickConvert([
        inFile,
        '-rotate',
        degrees,
        outFile,
    ])

// apply the decorator to handle GCS buckets
const transformApplyRotate = decorator(applyRotate)

// set default parameters and validation functions
transformApplyRotate.parameters = {
    outputPrefix: {
        defaultValue: 'rotated',
        validate: () => true,
    },
    outputBucketName: {
        defaultValue: 'cloud-maker-outputs-rotated',
        validate: () => true,
    },
    degrees: {
        defaultValue: 90,
        validate: (d) => !isNaN(d) && Number.isInteger(Number(d)),
    },
}

// attach the original functio for testing purposes
transformApplyRotate.applyRotate = applyRotate

module.exports = transformApplyRotate