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

// because the helper function uses the correct signature, we can
// use the decorator to convert it to a transformation
const transformApplyBlurPolygons = decorator(helpers.softBlurPolygons)

// query the vision api to annotate  all of the faces in the image,
// reducing the results to list of polygons that can be passed to
const detectFacePolygons = (file) =>
    vision
        // send a remote url to the vision api
        .faceDetection(`gs://${file.bucket.name}/${file.name}`)
        // convert the result a string usable by ImageMagick
        .then(([{faceAnnotations}]) =>
            faceAnnotations
                .map(helpers.faceAnnotationToBoundingPoly)
                .map((poly) => `polygon ${poly}`)
                .join(' ')
        )

const transformApplyBlurFaces = (file, parameters) =>
    detectFacePolygons(file)
        // apply the imageMagick transformation to the input file
        .then(
            (polygons) =>
                transformApplyBlurPolygons(
                    file,
                    Object.assign(parameters, {polygons})
                )
            )

transformApplyBlurFaces.parameters = {
    outputPrefix: {
        defaultValue: 'faces',
        validate: () => true,
    },
    outputBucketName: {
        defaultValue: 'cloud-maker-outputs-faces',
        validate: () => true,
    },
}


transformApplyBlurFaces.detectFacePolygons = detectFacePolygons

module.exports = transformApplyBlurFaces