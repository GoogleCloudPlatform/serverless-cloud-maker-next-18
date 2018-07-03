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

const VisionApi = require('@google-cloud/vision').v1p2beta1;
const vision = new VisionApi.ImageAnnotatorClient();


const detectCropHints = (file) =>
    vision
        // apply the crophints annotation on the input image
        .cropHints(`gs://${file.bucket.name}/${file.name}`)
        // extract the results of the api call
        .then(([{cropHintsAnnotation}]) => cropHintsAnnotation)

// taking a shape and the correct geometry string for that shape
// (rectangles wxh+x+y)
// (cricles centerX,centerY pointX,pointY)
// run ImageMagick's crop method to generate that shape
const applyCropGeometry = (inFile, outFile, {geometry, shape}) =>
    shape == 'circle'
        ? helpers.resolveImageMagickConvert([
                inFile,
                '\(',
                '+clone',
                '-alpha',
                'transparent',
                '-draw',
                geometry,
                '\)',
                '-compose',
                'copyopacity',
                '-composite',
                outFile,
            ])
        : helpers.resolveImageMagickConvert([
                inFile,
                '-crop',
                geometry,
                outFile,
            ])

const transformApplyCropGeometry = decorator(applyCropGeometry)


const transformApplyCropShape = (file, parameters) =>
    // detect the crop hints using the vision api
    detectCropHints(file)
        // use our helper function to convert the results of the api call to the wxh+x+y format
        .then((cropHintsAnnotation) => helpers.cropHintsToGeometry(cropHintsAnnotation, parameters.shape))
        // apply a crop
        .then((geometry) => transformApplyCropGeometry(file, Object.assign(parameters, {geometry})))


transformApplyCropShape.parameters = {
    outputBucketName: {
        defaultValue: 'cloud-maker-outputs-cropped',
        validate: () => true,
    },
    outputPrefix: {
        defaultValue: 'shape',
        validate: () => true,
    },
    shape: {
        defaultValue: 'suggested',
        validate: (s) => ['suggested', 'square', 'circle'].includes(s),
    },
    // we have to output a png here because cropping
    // to a cricle requires a transparent background
    extension: {
        defaultValue: '.png',
        validate: (s) => s == '.png',
    },
}

transformApplyCropShape.applyCropGeometry = applyCropGeometry
transformApplyCropShape.detectCropHints = detectCropHints


module.exports = transformApplyCropShape
