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

const transformApplyBlurPolygons = decorator(helpers.softBlurPolygons);

/*
 * Query the vision api to annotate  all of the faces in the image,
 * reducing the results to list of polygons that can be passed to
 */
const detectFaces = (file) => {
    return vision
        .faceDetection(`gs://${file.bucket.name}/${file.name}`)
        .then(([{faceAnnotations}]) => faceAnnotations);
};

const transformApplyBlurFaces = (file, parameters) => {
    return detectFaces(file)
        // convert the result a string usable by ImageMagick
        .then(helpers.annotationsToPolygons)
        // apply the imageMagick transformation to the input file
        .then(
            (polygons) =>
                transformApplyBlurPolygons(
                    file,
                    Object.assign(parameters, {polygons})
                )
            );
};

transformApplyBlurFaces.parameters = {
    outputPrefix: {
        defaultValue: 'faces',
    },
    outputBucketName: {
        defaultValue: null,
    },
};


transformApplyBlurFaces.detectFaces = detectFaces;

module.exports = transformApplyBlurFaces;
