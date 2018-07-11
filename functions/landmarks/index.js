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

const transformApplyCaption = require('../caption');

// resolves with the best lamndmark annotation that the vision api
// finds inside the image
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
}

const transformApplyLandmarks = (file, parameters) => {
    return detectLandmark(file)
        .catch(console.error)
        // extract the description from the
        // returned landmark annotation
        .then(({description}) =>
            transformApplyCaption(
                file, 
                Object.assign(
                    parameters, 
                    {caption: description || 'No landmark found.'})
                )
        )
        .catch(console.error);
}

transformApplyLandmarks.parameters = {
    outputPrefix: {
        defaultValue: 'landmark',
    },
    outputBucketName: {
        defaultValue: 'cloud-maker-outputs-landmarks',
    },
};

transformApplyLandmarks.detectLandmark = detectLandmark;

module.exports = transformApplyLandmarks;
