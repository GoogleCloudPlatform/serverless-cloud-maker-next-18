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

const transformApplyFilter = require('./index.js')

// create mock of the helper functions
jest.mock('../helpers.js')
const helpers = require('../helpers')
const inFile = 'inFile'
const outFile = 'outFile'

describe('when transformApplyFilter is called', () => {
  it('should accept, sepia, grayscale, or colorize parameters', () => {
    expect(transformApplyFilter.parameters).not.toBeUndefined();

    ['sepia', 'grayscale', 'colorize'].map((filter) => expect(transformApplyFilter.parameters.filterName.validate(filter)).toBe(true))
  });

  it('should call resolveImageMagickConvert', () => {
    transformApplyFilter.applyFilter(inFile, outFile, { filterName: 'grayscale' })
    expect(helpers.resolveImageMagickConvert).toHaveBeenCalledWith([inFile, '-colorspace', 'Gray', outFile])
  });
});
