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
jest.mock('../helpers.js');
const helpers = require('../helpers');

const rotateTransform = require('./index.js');

const inFile = 'inFile';
const outFile = 'outFile';
const degrees = 180;


describe('rotateTransform', () => {
  it('should have default parameters', () => {
    expect(rotateTransform.parameters).not.toBeUndefined();
  });

  it('should accept numeric integer inputs', () => {
    const numericDegrees = [90, 180, 0, '10', '20', null];
    numericDegrees.map((deg) =>
        expect(rotateTransform.parameters.degrees.validate(deg))
          .toBe(true)
      );
  });

  it('should reject non-numeric inputs', () => {
    const nonnumericDegrees = ['foo', NaN, '1.1', {}];
    nonnumericDegrees.map((deg) =>
        expect(rotateTransform.parameters.degrees.validate(deg))
          .toBe(false)
        );
  });

  it('should call resolveImageMagickConvert with the degrees', () => {
    helpers.resolveImageMagickConvert.mockClear();
    rotateTransform.applyRotate(inFile, outFile, {degrees});
    expect(helpers.resolveImageMagickConvert)
      .toHaveBeenCalledWith([inFile, '-rotate', degrees, outFile]);
  });
});

