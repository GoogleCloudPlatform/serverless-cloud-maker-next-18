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
const helpers = require('../helpers')
const decorator = require('../decorator')


// IMPORTANT: To use emojify you'll need to upload
// correctly named png files to a GCS bucket in accordance with
// this mapping, which you can do by running the
// upload emojis file
const emojis = {
    joyLikelihood: 'joy.png',
    angerLikelihood: 'anger.png',
    sorrowLikelihood: 'sorrow.png',
    surpriseLikelihood: 'surprise.png',
    expressionless: 'none.png',
}

// downloads all apple emojis
const downloadEmojis = () =>
    Promise.all(
        Object.keys(emojis)
            .map((key) =>
                storage
                    .bucket('emojis-apple')
                    .file(emojis[key])
                    .download({destination: `/tmp/${emojis[key]}`}))
    )

// get the emoji that best matches this face's emotion.
// If expressionless, return expressionless
const determineEmoji = (face) =>
    // index the result into the emojis object to return the
    // file name
    emojis[
        // get the best emoji for this face
        Object.keys(emojis).reduce(
            (emotion, nextEmotion) =>
                ['VERY_LIKELY', 'LIKELY', 'POSSIBLE'].includes(face[nextEmotion])
                ? nextEmotion
                : emotion
            // default to expressionless
            , 'expressionless'
        )
    ]

const faceAnnotationToEmojiComposite = (faceAnnotation) => (
    [
        '\(',
        `/tmp/${determineEmoji(faceAnnotation)}`,
        '-resize',
        helpers.annotationToDimensions(faceAnnotation),
        '\)',
        '-geometry',
        helpers.annotationToCoordinate(faceAnnotation),
        '-composite',
    ]
)

const applyComposites = (inFile, outFile, {composites}) =>
    helpers.resolveImageMagickConvert([
        inFile,
        ...composites,
        outFile,
    ])

const transformApplyComposites = decorator(applyComposites)

const transformApplyEmojify = (file, parameters) =>
    /*
    Use the vision api to annotate the
    faces in an image and then convet them
    to emojis based on the emotion they have
     */

    Promise.all([
        // send a remote url to the vision api
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
        .then((composites) => transformApplyComposites(file, Object.assign(parameters, {composites})))

transformApplyEmojify.parameters = {
        outputPrefix: {
            defaultValue: 'emojis',
            validate: () => true,
        },
        outputBucketName: {
            defaultValue: 'cloud-maker-outputs-emojis',
            validate: () => true,
        },
        emojiSet: {
            defaultValue: 'emojis-apple',
            validate: (v) => ['emojis-apple', 'emojis-google'].contains(v),
        },
    }

transformApplyEmojify.emojis = emojis

module.exports = transformApplyEmojify
