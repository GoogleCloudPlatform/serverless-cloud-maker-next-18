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

// first, mock storage so that when it is imported by the main file
// it receives the mock version
jest.mock('@google-cloud/storage')
const StorageAPI = require('@google-cloud/storage')
StorageAPI.prototype.bucket = jest.fn(() => new StorageAPI())
StorageAPI.prototype.download = jest.fn(() => Promise.resolve())
StorageAPI.prototype.file = jest.fn(() => new StorageAPI())

jest.mock('@google-cloud/vision');
const VisionAPI = require('@google-cloud/vision').v1p2beta1;

jest.mock('../decorator')
const decorator = require('../decorator')
const spy = jest.fn()
decorator.mockReturnValue(spy)


const mockResponse = [{faceAnnotations: []}]
VisionAPI.ImageAnnotatorClient.prototype.faceDetection.mockReturnValue(Promise.resolve(mockResponse))

const transformApplyEmojify = require('./index.js')

jest.mock('../helpers.js')
const helpers = require('../helpers')

const file = {
    bucket: {name: 'foo'},
    name: 'bar.png',
}

describe('when transformApplyEmojify is called', () => {
    it('should have default parameters', () => {
        expect(transformApplyEmojify.parameters).not.toBeUndefined()
    });

    it(`should download ${Object.keys(transformApplyEmojify.emojis).length} emojis`, () => {
        transformApplyEmojify(file, {})
        expect(StorageAPI.prototype.download)
            .toHaveBeenCalledTimes(Object.keys(transformApplyEmojify.emojis).length)
    });

    it(`should call faceDetection with the file`, () => {
        transformApplyEmojify(file, {})
        expect(VisionAPI.ImageAnnotatorClient.prototype.faceDetection)
            .toHaveBeenCalledWith('gs://foo/bar.png')
    });

    it('should call transformApplyComposites', () => {
        spy.mockClear()
        transformApplyEmojify(file, {}).then(() =>
            expect(spy).toHaveBeenCalledWith(file, {composites: []})
            )
    });

    it('should apply composites correctly', () => {
        const response = [{faceAnnotations: [{joyLikelihood: 'VERY_LIKELY'}]}]
        helpers.annotationToDimensions.mockReturnValue('baz')
        helpers.annotationToCoordinate.mockReturnValue('quxx')
        VisionAPI.ImageAnnotatorClient.prototype.faceDetection.mockReturnValue(Promise.resolve(response))
        spy.mockClear()
        transformApplyEmojify(file, {}).then(() =>
            expect(spy).toHaveBeenCalledWith(file, {composites: [
                '(',
                '/tmp/joy.png',
                '-resize',
                'baz',
                ')',
                '-geometry',
                'quxx',
                '-composite',
            ]})
        )
    });
});

