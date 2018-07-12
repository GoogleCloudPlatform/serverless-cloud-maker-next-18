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


const cropShapeTransform = require('./index');

describe('cropShapeTransform', () => {
    it('should have default parameters', () => {
        expect(cropShapeTransform.parameters).not.toBeUndefined();
    });

    ['suggested', 'square', 'circle'].map((shape) =>
        it(`should accept ${shape}`, () => {
            expect(cropShapeTransform.parameters.shape.validate(shape))
                .toBe(true);
        })
    );

    [false, 0, 'rectangle', null].map((shape) =>
        it(`should reject ${shape}`, () => {
            expect(cropShapeTransform.parameters.shape.validate(shape))
                .toBe(false);
        })
    );
    it('should only accept .png as the file extension', () => {
        expect(cropShapeTransform.parameters.extension.validate('.png'))
            .toBe(true);
        expect(cropShapeTransform.parameters.extension.validate('.jpg'))
            .toBe(false);
    });
});
