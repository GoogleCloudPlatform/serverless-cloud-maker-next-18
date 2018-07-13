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

const captionTransform = require('../caption');

/*
 * Query the Vision API's landmark detection and resolve with
 * the best annotation
 */
const detectLandmark = (file) => {
    return vision
        .landmarkDetection(`gs://${file.bucket.name}/${file.name}`)
        .then(([{landmarkAnnotations}]) =>
            landmarkAnnotations.reduce(
                (bestAnnotation, nextAnnotation) =>
                    nextAnnotation.score > bestAnnotation.score
                    ? nextAnnotation
                    : bestAnnotation
                , {score: 0})
        );
};

const landmarkTransform = (file, parameters) => {
    return detectLandmark(file)
        .catch(console.error)
        .then(({description}) =>
            captionTransform(
                file,
                Object.assign(
                    parameters,
                    {caption: description || 'No landmark found.'})
                )
        )
        .catch(console.error);
};

landmarkTransform.parameters = {
    outputPrefix: {
        defaultValue: 'landmark',
    },
    outputBucketName: {
        defaultValue: null,
    },
};

landmarkTransform.detectLandmark = detectLandmark;

module.exports = landmarkTransform;
