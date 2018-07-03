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
const VisionApi = require('@google-cloud/vision').v1p2beta1;
const vision = new VisionApi.ImageAnnotatorClient();

const transformApplyBlur = require('../blur')

// Given the safe search annotation returned by the cloud vision api, 
// determine if it is an unsafe image by comparing against the "adult" 
// and "violence"features
const isUnsafe = ([{safeSearchAnnotation}]) =>
    safeSearchAnnotation.adult === 'VERY_LIKELY' ||
    safeSearchAnnotation.violence === 'VERY_LIKELY'


const transformApplySafeSearch = (file, parameters) =>
    vision
        .safeSearchDetection(`gs://${file.bucket.name}/${file.name}`)
        .catch(console.err)
        .then((result) =>
            // if it's unsafe
            isUnsafe(result)
            // apply a blur
            ? transformApplyBlur(file, parameters)
            // otherwise just return the file
            : file
        )

transformApplySafeSearch.parameters = {
    outputPrefix: {
        defaultValue: 'safe',
        validate: () => true,
    },
    outputBucketName: {
        defaultValue: 'cloud-maker-outputs-safe',
        validate: () => true,
    },
}

module.exports = transformApplySafeSearch
