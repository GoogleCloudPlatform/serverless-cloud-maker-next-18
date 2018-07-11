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

const transformApplySafeSearch = require('./index.js');

jest.mock('../helpers.js');
const helpers = require('../helpers');

jest.mock('@google-cloud/vision');
const VisionApi = require('@google-cloud/vision').v1p2beta1;

jest.mock('../blur');
const transformApplyBlur = require('../blur');

const adultAnnotation = {
        adult: 'VERY_LIKELY',
};

const violenceAnnotation = {
        violence: 'VERY_LIKELY',
};

const controlAnnotation = {};

const file = {
        bucket: {name: 'foo'},
        name: 'bar.png',
};
VisionApi.ImageAnnotatorClient.prototype.safeSearchDetection.mockClear();
VisionApi.ImageAnnotatorClient.prototype.safeSearchDetection.mockReturnValue(Promise.resolve([{safeSearchAnnotation: controlAnnotation}]));

describe('when transformApplySafeSearch is called', () => {
    it('should have default parameters', () => {
            expect(transformApplySafeSearch.parameters).not.toBeUndefined();
    });


    it('should call safeSearchDetection', () => {
            VisionApi.ImageAnnotatorClient.prototype.safeSearchDetection.mockClear();
            VisionApi.ImageAnnotatorClient.prototype.safeSearchDetection.mockReturnValue(Promise.resolve([{safeSearchAnnotation: controlAnnotation}]));
            transformApplySafeSearch(file);
            expect(VisionApi.ImageAnnotatorClient.prototype.safeSearchDetection).toHaveBeenCalledWith('gs://foo/bar.png');
    });

    it('should blur when unsafe', () => {
        VisionApi.ImageAnnotatorClient.prototype.safeSearchDetection.mockClear();
        transformApplyBlur.mockClear();
        VisionApi.ImageAnnotatorClient.prototype.safeSearchDetection.mockReturnValue(Promise.resolve([{safeSearchAnnotation: adultAnnotation}]));
        return transformApplySafeSearch(file)
            .then(() => expect(transformApplyBlur).toHaveBeenCalled());
    });

    it('should blur when violent', () => {
        VisionApi.ImageAnnotatorClient.prototype.safeSearchDetection.mockClear();
        transformApplyBlur.mockClear();
        VisionApi.ImageAnnotatorClient.prototype.safeSearchDetection.mockReturnValue(Promise.resolve([{safeSearchAnnotation: violenceAnnotation}]));
        return transformApplySafeSearch(file)
            .then(() => expect(transformApplyBlur).toHaveBeenCalled());
    });
    it('should not blur when safe', () => {
            VisionApi.ImageAnnotatorClient.prototype.safeSearchDetection.mockClear();
            transformApplyBlur.mockClear();
            VisionApi.ImageAnnotatorClient.prototype.safeSearchDetection.mockReturnValue(Promise.resolve([{safeSearchAnnotation: controlAnnotation}]));
            return transformApplySafeSearch(file)
                .then(() => expect(transformApplyBlur).not.toHaveBeenCalled());
    });
});

