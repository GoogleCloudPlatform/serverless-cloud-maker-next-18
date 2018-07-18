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

const blurPolygonsTransform = decorator(helpers.blurPolygons);

const detectLogos = (file) => {
    return vision
        .logoDetection(`gs://${file.bucket.name}/${file.name}`)
        .then(([{logoAnnotations}]) => logoAnnotations);
};

const blurLogosTransform = (file, parameters) => {
    return detectLogos(file)
        .then(helpers.annotationsToPolygons)
        .then((polygons) =>
            blurPolygonsTransform(
                file,
                Object.assign(parameters, {polygons})
            )
        );
};

blurLogosTransform.parameters = {
    outputPrefix: {
        defaultValue: 'logo',
    },
    outputBucketName: {
        defaultValue: null,
    },
};

blurLogosTransform.detectLogos = detectLogos;


module.exports = blurLogosTransform;
