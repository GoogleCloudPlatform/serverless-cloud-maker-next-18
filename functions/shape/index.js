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

const VisionApi = require('@google-cloud/vision').v1p2beta1;
const vision = new VisionApi.ImageAnnotatorClient();


const detectCropHints = (file) => {
    return vision
        // apply the crophints annotation on the input image
        .cropHints(`gs://${file.bucket.name}/${file.name}`)
        .then(result => { console.log("Crop Hints result", result); return result })
        // extract the results of the api call
        .then(([{cropHintsAnnotation}]) => cropHintsAnnotation.cropHints[0]);
};

/*
 * Taking a shape and the correct geometry string for that shape
 * (rectangles wxh+x+y)
 * (cricles centerX,centerY pointX,pointY)
 * run ImageMagick's crop method to generate that shape
 */
const applyCropGeometry = (inFile, outFile, {geometry, shape}) => {
    if (shape == 'circle') {
        return helpers.resolveImageMagickConvert([
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
        ]);
    }

    return helpers.resolveImageMagickConvert([
        inFile,
        '-crop',
        geometry,
        outFile,
    ]);
};

const cropGeometryTransform = decorator(applyCropGeometry);


const cropShapeTransform = (file, parameters) => {
    return detectCropHints(file)
        .then((annotation) =>
            helpers.annotationToShape(annotation, parameters.shape)
        )
        .then((geometry) =>
            cropGeometryTransform(
                file,
                Object.assign(parameters, {geometry})
            )
        );
};


cropShapeTransform.parameters = {
    outputBucketName: {
        defaultValue: null,
    },
    outputPrefix: {
        defaultValue: 'shape',
    },
    shape: {
        defaultValue: 'suggested',
        validate: (s) => ['suggested', 'square', 'circle'].includes(s),
    },
    // Circles must be pngs to have transparent backgrounds
    extension: {
        defaultValue: '.png',
        // Always return a png
        validate: (s) => s == '.png',
    },
};

cropShapeTransform.applyCropGeometry = applyCropGeometry;
cropShapeTransform.detectCropHints = detectCropHints;


module.exports = cropShapeTransform;
