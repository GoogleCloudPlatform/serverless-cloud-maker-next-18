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
jest.mock('../decorator');
const decorator = require('../decorator');
const spy = jest.fn(() => Promise.resolve());
decorator.mockReturnValue(spy);


const blurLogosTransform = require('./index.js');


jest.mock('../helpers.js');
const helpers = require('../helpers');

jest.mock('@google-cloud/vision');
const VisionApi = require('@google-cloud/vision').v1p2beta1;

const mockDetection = VisionApi.ImageAnnotatorClient.prototype.logoDetection;


const file = {
    bucket: {name: 'foo'},
    name: 'bar.png',
};

describe('when blurLogosTransform is called', () => {
  it('should have default parameters', () => {
    expect(blurLogosTransform.parameters).not.toBeUndefined();
  });


  it('should blur the logos', () => {
        decorator.mockReturnValue(spy);
        mockDetection.mockClear();
        mockDetection.mockReturnValue(
            Promise.resolve([{logoAnnotations: 'result'}])
        );
        helpers.annotationsToPolygons.mockClear();
        helpers.annotationsToPolygons.mockReturnValue('polygons');
        const parameters = {};
        blurLogosTransform(file, parameters).then(() => {
            expect(helpers.annotationsToPolygons)
                .toHaveBeenCalledWith('result');
            expect(spy)
                .toHaveBeenCalledWith(file, {polygons: 'polygons'});
        });
  });
});

describe('when detectLogos is called', () => {
    it('should call the vision api', () => {
        mockDetection.mockClear();
        mockDetection.mockReturnValue(
            Promise.resolve([{logoAnnotations: 'result'}])
        );
        blurLogosTransform.detectLogos(file).then((result) => {
            expect(mockDetection)
                .toHaveBeenCalledWith(`gs://foo/bar.png`);
            expect(result)
                .toEqual('result');
        });
    });
});


