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
const transformApplyReflect = require('./index.js');

const inFile = 'inFile';
const outFile = 'outFile';
describe('when transformApplyReflect is called', () => {
    it('should accept x or y', () => {
        expect(transformApplyReflect.parameters.axis.validate).not.toBeUndefined();
        ['x', 'y'].map((axis) => expect(transformApplyReflect.parameters.axis.validate(axis)).toBe(true));

        ['a', 'z', null, false].map((axis) => expect(transformApplyReflect.parameters.axis.validate(axis)).toBe(false));
    });

    it('should call resolveImageMagickConvert', () => {
        transformApplyReflect.applyReflect(inFile, outFile, {axis: 'x'} );
        expect(helpers.resolveImageMagickConvert).toHaveBeenCalledWith([inFile, '-flip', outFile]);
        transformApplyReflect.applyReflect(inFile, outFile, {axis: 'y'} );
        expect(helpers.resolveImageMagickConvert).toHaveBeenCalledWith([inFile, '-flop', outFile]);
    });
});

