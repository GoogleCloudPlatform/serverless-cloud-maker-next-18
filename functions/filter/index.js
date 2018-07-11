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

// Apply a specified filter (sepia, grayscale, or random colorize) to
// an input image.
const helpers = require('../helpers');
const createImageMagickTransform = require('../decorator');

const applyFilter = (inFile, outFile, {filterName}) => {

    const randomHue = Math.random() * 200;

    const imageMagickFilters = {
        sepia: ['-sepia-tone', '80%'],
        grayscale: ['-colorspace', 'Gray'],
        colorize: ['-modulate', `100,100,${randomHue}`],
    };

    return helpers.resolveImageMagickConvert([
        inFile,
        ...imageMagickFilters[filterName],
        outFile,
    ]);
};

const transformApplyFilter = createImageMagickTransform(applyFilter);

transformApplyFilter.parameters = {
        outputPrefix: {
            defaultValue: 'filtered',
        },
        outputBucketName: {
            defaultValue: 'cloud-maker-outputs-filtered',
        },
        filterName: {
            defaultValue: 'sepia',
            validate: (v) => ['sepia', 'colorize', 'grayscale'].includes(v.toLowerCase()),
        },
    };

transformApplyFilter.applyFilter = applyFilter;

module.exports = transformApplyFilter;
