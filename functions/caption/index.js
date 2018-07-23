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
const gm = require('gm').subClass({imageMagick: true});

/*
 * Add a caption at the bottom of the image in the color specified
 * by the user, defaulting to a random google color if none is
 * specified.
 */
const applyCaption = (inFile, outFile, {caption, color}) => {
    const textColor = helpers.googleColors[color] ||
        helpers.randomGoogleColor();
    return new Promise((resolve, reject) =>{
        gm(inFile)
            .fill(textColor)
            .stroke(textColor)
            .fontSize(36)
            .font('DejaVu-Sans')
            .drawText(0, 0, caption, 'South')
            .write(outFile, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(outFile);
            });
    });
};

const annotationAsCaptionTransform = decorator(applyCaption);

const generateCaption = (file) => {
    return vision
        .labelDetection(`gs://${file.bucket.name}/${file.name}`)
        .then(([{labelAnnotations}]) =>{
            // find the maximum score among the annotations
            const maxScore = Math.max(...labelAnnotations.map((l) => l.score));
            // return the annotation with that score
            return labelAnnotations.find((l) => l.score === maxScore) ||
                // if there are no annotations, return a default caption
                {description: 'No caption found.'};
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
    color: {
        defaultValue: null,
        validate: (v) =>
            Object.keys(helpers.googleColors).includes(v),
    },
};

Object.assign(captionTransform, {
    applyCaption,
    annotationAsCaptionTransform,
    generateCaption,
});

module.exports = captionTransform;
