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

/*
 * Add a caption to the image by identifying its dimensions and then
 * adding a section at the bottom with a black background
 * and white centered text on top of it.
 */
const applyCaption = (inFile, outFile, {caption}) => {
    return helpers
        .resolveImageMagickIdentify(inFile)
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
                     `caption: ${caption}`,
                     inFile,
                     '+swap',
                     '-gravity',
                     'south',
                     '-composite',
                     outFile,
                    ])
            );
};

const annotationAsCaptionTransform = decorator(applyCaption);

const generateCaption = (file) => {
    return vision
        .labelDetection(`gs://${file.bucket.name}/${file.name}`)
        .then(([{labelAnnotations}]) =>{
            // find the maximum score among the annotations
            const maxScore = Math.max(...labelAnnotations.map((l) => l.score));
            // return the annotation with that score
            return labelAnnotations.find((l) => l.score === maxScore);
        })
        .then(({description}) => description);
};


const captionTransform = (file, parameters) => {
    if (parameters.caption) {
        return annotationAsCaptionTransform(
            file,
            parameters
        );
    }
    return generateCaption(file)
        .then(
            (caption) =>
                annotationAsCaptionTransform(
                    file,
                    Object.assign(parameters, {caption})
                )
        );
};

captionTransform.parameters = {
    outputPrefix: {
        defaultValue: 'caption',
    },
    outputBucketName: {
        defaultValue: null,
    },
    caption: {
        defaultValue: false,
        validate: (v) =>
            v
            // expect that it is the custom caption
            ? v.constructor == String && v.length > 0
            // otherwise return that is is valid
            : true,
    },
};

Object.assign(captionTransform, {
    applyCaption,
    annotationAsCaptionTransform,
    generateCaption,
});

module.exports = captionTransform;
