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

// module imports
const VisionApi = require('@google-cloud/vision').v1p2beta1;
const vision = new VisionApi.ImageAnnotatorClient();
const StorageApi = require('@google-cloud/storage');
const storage = new StorageApi();

// relative imports
const helpers = require('../helpers');
const decorator = require('../decorator');


/*
 * IMPORTANT: To use emojify you'll need to upload
 * correctly named png files to a GCS bucket in accordance with
 * this mapping, which you can do by running
 * `node uploadEmojis.js`
 */ 
const emojis = {
    joyLikelihood: 'joy.png',
    angerLikelihood: 'anger.png',
    sorrowLikelihood: 'sorrow.png',
    surpriseLikelihood: 'surprise.png',
    expressionless: 'none.png',
};

const downloadEmojis = ({emojiSet}) => {
    return Promise.all(
        Object
            .keys(emojis)
            .map((key) =>
                storage
                    .bucket(emojiSet)
                    .file(emojis[key])
                    .download({destination: `/tmp/${emojis[key]}`})
            )
    );
};

// get the emoji that best matches this face's emotion.
// If expressionless, return expressionless
const determineEmoji = (face) => {
    let bestEmoji = Object
        .keys(emojis)
        .find((emotion) =>
            ['VERY_LIKELY', 'LIKELY', 'POSSIBLE'].includes(face[emotion])
        );

    if (!bestEmoji) {
        return emojis.expressionless;
    }

    return emojis[bestEmoji];
};
const faceAnnotationToEmojiComposite = (faceAnnotation) => {
    return [
        '\(',
        `/tmp/${determineEmoji(faceAnnotation)}`,
        '-resize',
        helpers.annotationToDimensions(faceAnnotation),
        '\)',
        '-geometry',
        helpers.annotationToCoordinate(faceAnnotation),
        '-composite',
    ];
};

const applyComposites = (inFile, outFile, {composites}) => {
    return helpers.resolveImageMagickConvert([
        inFile,
        ...composites,
        outFile,
    ]);
};

const transformApplyComposites = decorator(applyComposites);

const transformApplyEmojify = (file, parameters) => {
    return Promise.all([
            // send a remote url to the Vision API
            vision.faceDetection(`gs://${file.bucket.name}/${file.name}`),
            // simultaneously download all of the necessary emojis
            downloadEmojis(parameters),
        ])
        // convert the result to its most relevant emoji
        .then(([[{faceAnnotations}]]) =>
            faceAnnotations
                .map(faceAnnotationToEmojiComposite)
                // reduce the result to a single array of composites
                .reduce((acc, nextComposite) => acc.concat(nextComposite), [])
        )
        // apply those composites over the image
        .then((composites) =>
            transformApplyComposites(
                file,
                Object.assign(parameters, {composites})
            )
        );
};

transformApplyEmojify.parameters = {
        outputPrefix: {
            defaultValue: 'emojis',
        },
        outputBucketName: {
            defaultValue: 'cloud-maker-outputs-emojis',
        },
        emojiSet: {
            defaultValue: 'emojis-apple',
            validate: (v) => ['emojis-apple', 'emojis-google'].contains(v),
        },
    };

transformApplyEmojify.emojis = emojis;

module.exports = transformApplyEmojify;
