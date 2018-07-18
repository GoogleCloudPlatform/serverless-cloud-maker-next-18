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

const blurTransform = require('../blur');

/*
 *Given the safe search annotation returned by the cloud vision api,
 * determine if it is an unsafe image by comparing against the "adult"
 * and "violence"features
 */
const isUnsafe = ([{safeSearchAnnotation}]) =>
    safeSearchAnnotation.adult === 'VERY_LIKELY' ||
    safeSearchAnnotation.violence === 'VERY_LIKELY';


/*
 * Query the SafeSearch endpoint of the Vision API
 * and if it returns unsafe, apply a blur effect
 * to the image.
 */
const safeSearchTransform = (file, parameters) => {
    return vision
        .safeSearchDetection(`gs://${file.bucket.name}/${file.name}`)
        .then((result) =>
            isUnsafe(result)
            ? blurTransform(file, parameters)
            : file
        );
};

safeSearchTransform.parameters = {
    outputPrefix: {
        defaultValue: 'safe',
    },
    outputBucketName: {
        defaultValue: null,
    },
};

module.exports = safeSearchTransform;
