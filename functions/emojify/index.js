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
const StorageApi = require('@google-cloud/storage');
const storage = new StorageApi();

// IMPORTANT: To use emojify you'll need to upload
// correctly named png files to a GCS bucket in accordance with
// this mapping
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

const determineEmoji = (face) => {
    console.log(face)
    return emojis[Object.keys(emojis).reduce(
        (emotion, nextEmotion) =>
            ['VERY_LIKELY', 'LIKELY', 'POSSIBLE'].includes(face[nextEmotion])
            ? nextEmotion
            : emotion
        , 'expressionless'
    )]
}

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
        downloadEmojis(),
    ])

        // convert the result to its most relevant emoji
        .then(([[{faceAnnotations}]]) =>
            faceAnnotations
                .map(faceAnnotationToEmojiComposite)
                .reduce((acc, nextComposite) => acc.concat(nextComposite), [])
        )

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
    }

transformApplyEmojify.emojis = emojis

module.exports = transformApplyEmojify
