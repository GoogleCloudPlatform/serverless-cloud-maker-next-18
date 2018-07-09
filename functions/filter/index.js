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
const helpers = require('../helpers')
const createImageMagickTransform = require('../decorator')

// each time this function runs, generate a random 
// hue to filter by
const randomHue = Math.random() * 200

// map parameter names for filters
// to the arguments we need to pass to
// imagemagick
const imageMagickFilters = {
    sepia: ['-sepia-tone', '80%'],
    grayscale: ['-colorspace', 'Gray'],
    colorize: ['-modulate', `100,100,${randomHue}`],
}

const applyFilter = (inFile, outFile, {filterName = imageMagickFilters.sepia}) =>
    helpers.resolveImageMagickConvert([
        inFile,
        ...imageMagickFilters[filterName],
        outFile,
    ])

const transformApplyFilter = createImageMagickTransform(applyFilter)

transformApplyFilter.parameters = {
        outputPrefix: {
            defaultValue: 'filtered',
            validate: () => true,
        },
        outputBucketName: {
            defaultValue: 'cloud-maker-outputs-filtered',
            validate: () => true,
        },
        filterName: {
            defaultValue: 'sepia',
            validate: (v) => Object.keys(imageMagickFilters).includes(v.toLowerCase()),
        },
    }
transformApplyFilter.applyFilter = applyFilter

module.exports = transformApplyFilter
