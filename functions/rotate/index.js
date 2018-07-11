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

// This file defines a function that rotates an image
// by a specified number of degrees
const helpers = require('../helpers');
const decorator = require('../decorator');

const applyRotate = (inFile, outFile, {degrees}) => {
    return helpers.resolveImageMagickConvert([
        inFile,
        '-rotate',
        degrees,
        outFile,
    ]);
};

const rotateTransform = decorator(applyRotate);

rotateTransform.parameters = {
    outputPrefix: {
        defaultValue: 'rotated',
    },
    outputBucketName: {
        defaultValue: 'cloud-maker-outputs-rotated',
    },
    degrees: {
        defaultValue: 90,
        validate: (d) => !isNaN(d) && Number.isInteger(Number(d)),
    },
};

rotateTransform.applyRotate = applyRotate;

module.exports = rotateTransform;
