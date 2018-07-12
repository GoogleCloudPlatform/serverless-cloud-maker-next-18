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

const borderTransform = require('./index.js');

jest.mock('../helpers.js');
const helpers = require('../helpers');

const inFile = 'inFile';
const outFile = 'outFile';
const color = 'blue';
const width = 10;

describe('when borderTransform is called', () => {
  // it should accept google colors
  ['blue', 'green', 'yellow', 'red'].map((color) =>

    it(`it should accept ${color}`, () => {
      expect(borderTransform.parameters.color.validate(color)).toBe(true);
        })
  );

  // it should not accept non-google colors
  ['magenta', 'false', 'goldenrod', '0'].map((color) =>

    it(`it should not accept ${color}`, () => {
      expect(borderTransform.parameters.color.validate(color)).toBe(false);
        })
  );

  [10, '20', 30.0].map((width) =>
    it(`should accept ${width}`, () => {
      expect(borderTransform.parameters.width.validate(width)).toBe(true);
    })
  );

  [200, 'foo', 30.01].map((width) =>
    it(`should not accept ${width}`, () => {
      expect(borderTransform.parameters.width.validate(width)).toBe(false);
    })
  );

  it('should call resolveImageMagickConvert', () => {
    borderTransform.applyBorder(inFile, outFile, {width, color});
    expect(helpers.resolveImageMagickConvert)
      .toHaveBeenCalledWith([
        inFile,
        '-bordercolor',
        '#4285F4',
        '-border',
        '10%x10%',
        outFile]);
  });
});
