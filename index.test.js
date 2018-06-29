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

/*
Test the handler and validation functions declared in
index.js
 */

const index = require('./index.js')
const functions = index.functions
const handler = index.handler

const validateRequest = index.validateRequest
const validateData = index.validateData
const validateFunction = index.validateFunction
const validateParameters = index.validateParameters
const assignParameters = index.assignParameters

// TODO: Create a function that can be mapped over
// our functions to make sure they meet basic conditions

// const testHelpers = require("./testHelpers.js")

// const functionsToTest = [
//  functions.transformApply,
//  functions.testBlurWithUpload,
//  functions.testCropSuggestion,
// ]

// functionsToTest.map(testHelpers.describeCloudMakerFunction)
//
// testHelpers.describeCloudMakerFunction(functions.testBlur)


// Sanity Check
describe('when this test suite runs', () => {
    it('should not break', () => {
        expect(true).toBe(true);
    });
});

// if we have a request.json that we are currently testing with,
// want to make sure that it is valid. We can skip this test for
// now as we gitignore request.json because it contains GCS storage urls
describe.skip('request.json', () => {
    it('should be valid json', () => {
        const request = require('./request.json')
        expect(() => validateRequest({body: request})).not.toThrow('');
    });
});

const validData = {
    gcsSourceUri: 'foo',
    name: 'bar',
    bucket: 'baz',
}

describe('validateRequest', () => {
    it('should reject requests without data', () => {
        const request = {}
        expect(() => validateRequest(request)).toThrow('Invalid request')
    });

    it('should reject requests with data but without data and functions', () => {
        const request = {body: {}}
        expect(() => validateRequest(request)).toThrow('Invalid request')
    });

    it('should reject requests with data but without data and functions', () => {
        const request1 = {body: {data: {}}}
        const request2 = {body: {functions: []}}
        expect(() => validateRequest(request1)).toThrow('Invalid request')
        expect(() => validateRequest(request2)).toThrow('Invalid request')
    });

    it('should accept requests with correct data and functions', () => {
        const request = {body: {data: validData, functions: []}}
        expect(validateRequest(request)).toBe(true)
    });
});


describe('validateData', () => {
    it('should throw when there is no gcsUri', () => {
        expect(() => validateData({})).toThrow('No gcsSourceUri specified')
    });
    it('should throw when there is no bucket', () => {
        expect(() => validateData({gcsSourceUri: 'asdf'})).toThrow('No bucket specified')
    });

    it('should throw when there is no name', () => {
        expect(() => validateData({gcsSourceUri: 'asdf', bucket: 'asdf'})).toThrow('No name specified')
    });
});

describe('validateFunction', () => {
    it('should throw when there is no name', () => {
        expect(() => validateFunction({})).toThrow('No function name specified')
    });

    it('should throw when a function does not exist', () => {
        const name = 'functionThatDoesNotExist'
        expect(() => validateFunction({name})).toThrow(`No function exists with name ${name}`)
    });
});


describe('when the handler is called', () => {
    const mockRequest = {
        body: {
          data: validData,
          functions: [],
      },
    }


    mockRequest.body.functions.reduce = jest.fn(() => Promise.resolve())


    const mockResponse = {
        send: jest.fn(),
    };

    const callFunction = () => handler(mockRequest, mockResponse);


    it('should reduce over its data instead', () => {
        mockRequest.body.functions.reduce.mockClear();
        return callFunction()
            .then(() => {
                expect(mockRequest.body.functions.reduce).toHaveBeenCalled();
            });
    });
});


describe('when validateParameters is called', () => {
    functions.testFunction = {
        parameters: {
            outputBucketName: {
                defaultValue: 'cloud-maker-outputs',
                validate: jest.fn(() => true),
            },
        }}

    it('should work with defaults', () => {
        expect(validateParameters('testFunction', {})).toBe(true)
    });

    it('should work with custom parameters that are validated', () => {
        const outputBucketName = 'asdf'
        expect(validateParameters('testFunction', {outputBucketName})).toBe(true)
        expect(functions.testFunction.parameters.outputBucketName.validate).toHaveBeenCalledWith(outputBucketName)
    });

    it('should thow for bad parameter keys', () => {
        const aBadParameter = 'aBadParameter'
        expect(() => validateParameters('testFunction', {aBadParameter})).toThrow('Parameter aBadParameter not expected for function testFunction. Expected one of outputBucketName')
    });

    it('should throw for bad parameter values', () => {
        functions.testFunction.parameters.outputBucketName.validate.mockClear()
        functions.testFunction.parameters.outputBucketName.validate.mockReturnValue(false)
        const outputBucketName = 'asdf'
        expect(() => validateParameters('testFunction', {outputBucketName})).toThrow('Parameter outputBucketName with value asdf was rejected by testFunction')
    });
});


describe('when assignParameters is called', () => {
    functions.testFunction.parameters = {
        outputBucketName: {
            defaultValue: 'cloud-maker-outputs',
            validate: jest.fn(() => true),
        },
    }

    it('should include the default parameters', () => {
        expect(assignParameters('testFunction', {})).toEqual({
            outputBucketName: 'cloud-maker-outputs',
        })
    });

    it('should add the custom parameters and run the validator', () => {
        const outputBucketName = 'asdf'
        expect(assignParameters('testFunction', {outputBucketName})).toEqual({outputBucketName})
        expect(functions.testFunction.parameters.outputBucketName.validate).toHaveBeenCalledWith(outputBucketName)
    });

    // because we've already validated the input, we can assume it's good here
    it.skip('should thow for bad parameter keys', () => {
        const aBadParameter = 'aBadParameter'
        expect(() => assignParameters('testFunction', {aBadParameter})).toThrow('Parameter aBadParameter not expected for function testFunction. Expected one of outputBucketName')
    });

    // because we've already validated the input we can assume it's good
    it.skip('should throw for bad parameter values', () => {
        functions.testFunction.parameters.outputBucketName.validate.mockClear()
        functions.testFunction.parameters.outputBucketName.validate.mockReturnValue(false)
        const outputBucketName = 'asdf'
        expect(() => assignParameters('testFunction', {outputBucketName})).toThrow('Parameter outputBucketName with value asdf was rejected by testFunction')
    });
});
