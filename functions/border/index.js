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
const decorator = require('../decorator');


const applyBorder = (inFile, outFile, {color, width}) => {
    const borderColor = helpers.googleColors[color] ||
        // if they didn't select a color, use a random one
        helpers.randomGoogleColor();
    return helpers.resolveImageMagickConvert([
        inFile,
        '-bordercolor',
        borderColor,
        '-border',
        `${width}%x${width}%`,
        outFile,
    ]);
};

const borderTransform = decorator(applyBorder);

borderTransform.parameters = {
    outputPrefix: {
        defaultValue: 'bordered',
    },
    outputBucketName: {
        defaultValue: null,
    },
    color: {
        defaultValue: null,
        validate: (v) =>
            Object.keys(helpers.googleColors).includes(v),
    },
    width: {
        defaultValue: '2',
        validate: (v) =>
            !isNaN(v) &&
            Number.isInteger(Number(v)) &&
            Number(v) >= 1 &&
            Number(v) <= 100,
    }
};

borderTransform.applyBorder = applyBorder;

module.exports = borderTransform;
