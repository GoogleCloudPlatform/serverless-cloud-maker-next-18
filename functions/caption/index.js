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

// add a caption to the image by identifying its dimensions and then
// adding a section at the bottom with a black background
// and white centered text on top of it.
const applyCaption = (inFile, outFile, {caption}) =>
    helpers
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
            )

const transformApplyAnnotationAsCaption = decorator(applyCaption)

// using the vision api
const generateCaption = (file) =>
    vision
        .labelDetection(`gs://${file.bucket.name}/${file.name}`)
        .then(([{labelAnnotations}]) =>{
            // find the maximum score among the annotations
            const maxScore = Math.max(...labelAnnotations.map((l) => l.score))
            // return the annotation with that score
            return labelAnnotations.find((l) => l.score === maxScore)
        })
        .then(({description}) => description)


const transformApplyCaption = (file, parameters) =>
    (
        // if a caption was set
        parameters.caption
        // use that caption
        ? Promise.resolve(parameters.caption)
        // otherwise, use the vision api to generate one
        : generateCaption(file)
    )
    .catch(console.error)
    .then((caption) => transformApplyAnnotationAsCaption(file, Object.assign(parameters, {caption})))


transformApplyCaption.parameters = {
    outputPrefix: {
        defaultValue: 'caption',
    },
    outputBucketName: {
        defaultValue: 'cloud-maker-outputs-captions',
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
}

transformApplyCaption.applyCaption = applyCaption
transformApplyCaption.transformApplyAnnotationAsCaption = transformApplyAnnotationAsCaption
transformApplyCaption.generateCaption = generateCaption

module.exports = transformApplyCaption
