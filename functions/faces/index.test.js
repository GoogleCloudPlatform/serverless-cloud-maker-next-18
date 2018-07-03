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
const transformApplyBlurFaces = require('./index.js')

jest.mock('../helpers.js')
const helpers = require('../helpers')

jest.mock('@google-cloud/vision')
const VisionApi = require('@google-cloud/vision').v1p2beta1;

describe('when transformApplyBlurFaces is called', () => {
    it('should have default parameters', () => {
        expect(transformApplyBlurFaces.parameters).not.toBeUndefined()
    });

    it('should call the vision api', () => {
        const polygon = 'polygon'
        const faceAnnotations = [{polygon}]

        const file = {
            name: 'bar.png',
            bucket: {name: 'foo'},
        }

        helpers.annotationsToPolygons.mockReturnValue(polygon)


        VisionApi
            .ImageAnnotatorClient
            .prototype
            .faceDetection
            .mockReturnValue(Promise.resolve([{faceAnnotations}]))


        return transformApplyBlurFaces
            .detectFaces(file)
            .then((annotations) => {
                expect(
                    VisionApi
                        .ImageAnnotatorClient
                        .prototype
                        .faceDetection
                    )
                    .toHaveBeenCalledWith(`gs://foo/bar.png`);
                expect(annotations).toEqual(faceAnnotations)
            })
    });
});
