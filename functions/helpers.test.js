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
const helpers = require('./helpers')

describe('when createOutputFileName is called', () => {
    const filename = 'filename.png'
    const filenamedotout = filename + '.out'
    const prefix = 'prefix'
    const prefixfilename = prefix + '-' + filename

    it('should append .out if the prefix coerces to false', () => {
        expect(helpers.createOutputFileName('', filename)).toBe(filenamedotout)
        expect(helpers.createOutputFileName(false, filename)).toBe(filenamedotout)
        expect(helpers.createOutputFileName(null, filename)).toBe(filenamedotout)
    });

    it('should add the passed prefix', () => {
        expect(helpers.createOutputFileName(prefix, filename)).toBe(prefixfilename)
    });

    it('should pass these base cases', () => {
        expect(helpers.createOutputFileName('foo', 'bar.png')).toBe('foo-bar.png')
        expect(helpers.createOutputFileName('', 'bar.png')).toBe('bar.png.out')
    });
});

describe(' when cropHintsToGeometry is called', () => {
    const testResponseFactory = (vertices) => ({
        cropHints: [
            {
                boundingPoly: {
                    vertices,
                },
            },
        ],

    })

    it('should work', () => {
        const testResponse = testResponseFactory([
                        {x: 0, y: 0},
                        {x: 100, y: 0},
                        {x: 0, y: 100},
                        {x: 100, y: 100},
            ])
        expect(helpers.cropHintsToGeometry(testResponse)).toEqual(`100x100+0+0`)
    });

    it('should set offsets correctly', () => {
        const testResponse = testResponseFactory([
            {x: 10, y: 15},
            {x: 100, y: 100},
            {x: 100, y: 15},
            {x: 10, y: 100},
        ])
        expect(helpers.cropHintsToGeometry(testResponse)).toEqual(`90x85+10+15`)
    });
});

describe('when faceAnnotationToBoundingPoly is called', () => {
    const testAnnotationFactory = (vertices) => ({
        boundingPoly: {
            vertices,
        },
    })
    it('should reduce the list of vertices to a string of tubles', () => {
        const testAnnotation = testAnnotationFactory([
            {x: 1, y: 2},
            {x: 3, y: 4},
            {x: 5, y: 6},
            {x: 7, y: 8},

        ])
        expect(helpers.faceAnnotationToBoundingPoly(testAnnotation)).toEqual('1,2 3,4 5,6 7,8')
    });
});

describe('when createOutputFileName is called', () => {
    it('should join the prefix to the previous file name and store it in temp', () => {
        expect(helpers.createOutputFileName('blurred', 'foo.js')).toBe('blurred-foo.js')
    });
});

describe('when createTempFileName is called', () => {
    it('should just prepend /tmp/', () => {
        expect(helpers.createTempFileName('test2.js')).toBe('/tmp/test2.js')
    });
});

describe('when createTempFileName and createOutputFileName are used together', () => {
    it('should work nicely', () => {
        expect(
            helpers.createTempFileName(
                helpers.createOutputFileName('cropped', 'img1.js')
                )
            ).toBe('/tmp/cropped-img1.js')
    });
});

describe('when resolveImageMagickCommand is used', () => {
    it('should call the passed function on the inputs', () => {
        const cmd = jest.fn()
        const args = []
        helpers.resolveImageMagickCommand(cmd, args)
        expect(cmd).toHaveBeenCalled()
    });

    it('should reject if the command throws', () => {
        const result = 'result'
        const goodCmd = jest.fn((a, cb) => cb(false, result))
        const args = []
        helpers
            .resolveImageMagickCommand(goodCmd, args)
            .then((r) => expect(r).toBe(result))
    });

    it('should resolve if the command succeeds', () => {
        const err = 'err'
        const badCmd = jest.fn((a, cb) => cb(err, false))
        const args = []
        helpers
            .resolveImageMagickCommand(badCmd, args)
            .catch((e) => expect(e).toBe(err))
    });
});
