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

const safeSearchTransform = require('./index.js');

jest.mock('@google-cloud/vision');
const VisionApi = require('@google-cloud/vision').v1p2beta1;

jest.mock('../blur');
const blurTransform = require('../blur');

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

const mockDetection = VisionApi
    .ImageAnnotatorClient
    .prototype
    .safeSearchDetection;

mockDetection.mockClear();

mockDetection.mockReturnValue(
    Promise.resolve([{safeSearchAnnotation: controlAnnotation}])
);

describe('when safeSearchTransform is called', () => {
    it('should have default parameters', () => {
            expect(safeSearchTransform.parameters).not.toBeUndefined();
    });


    it('should call safeSearchDetection', () => {
            mockDetection.mockClear();
            mockDetection.mockReturnValue(
                Promise.resolve([{safeSearchAnnotation: controlAnnotation}])
            );
            safeSearchTransform(file);
            expect(mockDetection).toHaveBeenCalledWith('gs://foo/bar.png');
    });

    it('should blur when unsafe', () => {
        mockDetection.mockClear();
        blurTransform.mockClear();
        mockDetection.mockReturnValue(
            Promise.resolve([{safeSearchAnnotation: adultAnnotation}])
        );
        return safeSearchTransform(file)
            .then(() => expect(blurTransform).toHaveBeenCalled());
    });

    it('should blur when violent', () => {
        mockDetection.mockClear();
        blurTransform.mockClear();
        mockDetection.mockReturnValue(
            Promise.resolve([{safeSearchAnnotation: violenceAnnotation}])
        );
        return safeSearchTransform(file)
            .then(() => expect(blurTransform).toHaveBeenCalled());
    });
    it('should not blur when safe', () => {
            mockDetection.mockClear();
            blurTransform.mockClear();
            mockDetection.mockReturnValue(
                Promise.resolve([{safeSearchAnnotation: controlAnnotation}])
            );
            return safeSearchTransform(file)
                .then(() => expect(blurTransform).not.toHaveBeenCalled());
    });
});

