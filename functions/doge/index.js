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
 * Scatter the passed captions around the image in
 * all the colors of the Google Rainbow
 */
const applyDogeCaptions = (inFile, outFile, {captions}) => {
    return new Promise((resolve, reject) => {
        helpers
            .resolveImageMagickIdentify(inFile)
            .then(({format, width, height}) => {
                // make the font size 5% of the height of image
                const fontSize = Math.floor(height * .05);
                // use these to define a function to reduce with
                const dogeCaptionReducer = (acc, nextCaption, idx) => {
                    const color = helpers.nextGoogleColor(idx);
                    return acc
                        .fill(color)
                        .stroke(color)
                        .fontSize(fontSize)
                        .font('DejaVu-Sans')
                        .drawText(
                            Math.floor(Math.random() * height),
                            Math.floor(Math.random() * width),
                            nextCaption.caption
                        );
                };

                return captions
                    .reduce(dogeCaptionReducer, gm(inFile));
            })
            .then((gmFile) => {
                gmFile
                    .write(outFile, (err) =>{
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(outFile);
                        return;
                    });
            });
    });
};

const dogeCaptionsTransform = decorator(applyDogeCaptions);


const dogeWords = [
    'so',
    'much',
    'very',
    'such',
    'too',
];

const nextDogeWord = (idx) =>
    dogeWords[idx % dogeWords.length];

const generateCaptions = (file) =>
    vision
        .labelDetection(`gs://${file.bucket.name}/${file.name}`)
        .then(([{labelAnnotations}]) =>
            labelAnnotations
                .map(({description}, idx) => ({
                    caption: `${nextDogeWord(idx)} ${description}`,
                }))
                .concat([
                    {caption: 'wow'},
                    {caption: 'wow'},
                ])
        );


const dogeTransform = (file, parameters) => {
    return generateCaptions(file)
        .then(
            (captions) =>
                dogeCaptionsTransform(
                    file,
                    Object.assign(parameters, {captions})
                )
        );
};

dogeTransform.parameters = {
    outputPrefix: {
        defaultValue: 'doge',
    },
    outputBucketName: {
        defaultValue: null,
    },
};

Object.assign(dogeTransform, {
    applyDogeCaptions,
    dogeCaptionsTransform,
    generateCaptions,
});

module.exports = dogeTransform;
