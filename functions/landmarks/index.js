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
const im = require('imagemagick')

const VisionApi = require('@google-cloud/vision').v1p2beta1;
const vision = new VisionApi.ImageAnnotatorClient();

const applyCaption = (inFile, outFile, {description}) =>
    helpers
        .resolveImageMagickCommand(im.identify, inFile)
        .then(({format, width, height}) =>
            helpers
                .resolveImageMagickConvert([
                     '-background',
                     '#0008',
                     '-fill',
                     'white',
                     '-gravity',
                     'center',
                     '-size',
                     `${width}x30`,
                     `caption: ${description}`,
                     inFile,
                     '+swap',
                     '-gravity',
                     'south',
                     '-composite',
                     outFile,
                    ])
            )

const transformApplyAnnotationAsCaption = decorator(applyCaption)

const transformApplyLandmarks = (file, parameters) =>
    vision
        .landmarkDetection(`gs://${file.bucket.name}/${file.name}`)
        .then(([{landmarkAnnotations}]) =>
            landmarkAnnotations.reduce(
                (bestAnnotation, nextAnnotation) =>
                    nextAnnotation.score > bestAnnotation.score
                    ? nextAnnotation
                    : bestAnnotation
                )

        )
        .then(({description}) => transformApplyAnnotationAsCaption(file, Object.assign(parameters, {description})))
        .catch(console.error)


transformApplyLandmarks.parameters = {
    outputPrefix: {
        defaultValue: 'landmark',
        validate: () => true,
    },
    outputBucketName: {
        defaultValue: 'cloud-maker-outputs-landmarks',
        validate: () => true,
    },
}


module.exports = transformApplyLandmarks
