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
const captionTransform = require('./index.js');

jest.mock('../helpers.js');
const helpers = require('../helpers');

jest.mock('@google-cloud/vision');
const VisionApi = require('@google-cloud/vision').v1p2beta1;

const inFile = 'inFile';
const outFile = 'outFile';
const caption = 'caption';

describe('when captionTransform is called', () => {
    it('should have default parameters', () => {
        expect(captionTransform.parameters).not.toBeUndefined();
    });

    [false, 'a', null, 0].map((caption) =>
        it(`should accept ${caption}`, () => {
            expect(
                captionTransform
                    .parameters
                    .caption
                    .validate(caption)
                )
                .toBe(true);
    }));

    [true, {}, 1].map((caption) =>
        it(`should reject ${caption}`, () => {
            expect(
                captionTransform
                    .parameters
                    .caption
                    .validate(caption)
                )
                .toBe(false);
        })
    );

    it.skip('should call resolveImageMagickConvert', () => {
        captionTransform.applyRotate('a', 'b', {width: 1, height: 1});
        expect(helpers.resolveImageMagickConvert).toHaveBeenCalled();
    });
});

describe('when generateCaption is called', () => {
    it('should call the vision api', () => {
        const labelAnnotations = [
            {description: 'bestDescription', score: 1.0},
            {descrption: 'worstDescription', score: -1.0},
        ];
        VisionApi
            .ImageAnnotatorClient
            .prototype
            .labelDetection
            .mockReturnValue(Promise.resolve([{labelAnnotations}]));

        const file = {
            bucket: {
                name: 'foo',
            },
            name: 'bar.png',
        };

        return captionTransform.generateCaption(file).then((caption) =>{
            expect(VisionApi.ImageAnnotatorClient.prototype.labelDetection).toHaveBeenCalledWith(`gs://foo/bar.png`);
            expect(caption).toEqual('bestDescription');
        });
    });
});

describe.skip('when applyCaption is called', () => {
    it('should identify and then convert', () => {
        helpers
            .resolveImageMagickIdentify
            .mockReturnValue(Promise.resolve({width: 1, height: 1}));
        helpers
            .resolveImageMagickConvert
            .mockReturnValue(Promise.resolve());
        return captionTransform
            .applyCaption(inFile, outFile, {caption})
            .then(() => {
                expect(helpers.resolveImageMagickIdentify)
                    .toHaveBeenCalledWith(inFile);
                expect(helpers.resolveImageMagickConvert)
                    .toHaveBeenCalledWith([
                        '-background',
                             '#0008',
                             '-fill',
                             'white',
                             '-gravity',
                             'center',
                             '-size',
                             `${1}x30`,
                             `caption: ${caption}`,
                             inFile,
                             '+swap',
                             '-gravity',
                             'south',
                             '-composite',
                             outFile,
                        ]);
            });
    });
});
