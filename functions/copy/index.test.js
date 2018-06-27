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


const copyImage = require('./index.js')

jest.mock("@google-cloud/storage")
const StorageAPI = require("@google-cloud/storage")


const copySpy = jest.fn(() => Promise.resolve())

const mockFile = {
    name: "foo.png",
    copy: copySpy,
}

// mock the bucket method to enable us to chain with it
StorageAPI.prototype.bucket.mockReturnValue(new StorageAPI())

// create a mock file method for chaining that just returns
// our mock file
StorageAPI.prototype.file = jest.fn(() => mockFile)


describe('when copyImage is called', () => {
    it('should not break', () => {
        expect(true).toBe(true);
    });

    it('should have default parameters', () => {
        expect(copyImage.parameters).not.toBeUndefined()
    });

    it('should accept any output bucket name or prefix', () => {
        expect(copyImage.parameters.outputBucketName.validate()).toBe(true)
        expect(copyImage.parameters.outputPrefix.validate()).toBe(true)
    });

    it('should call copy the file to the cloud storage output bucket', () => {

        const parameters = {
            outputBucketName: "output-bucket",
            outputPrefix: "output",
        }

        const result = copyImage(mockFile, parameters)
        expect(StorageAPI.prototype.bucket).toHaveBeenCalledWith(parameters.outputBucketName)
        expect(copySpy).toHaveBeenCalled()
        
        return result.then((outputFile) => {
            expect(outputFile).toEqual(mockFile)
        }) 

    });

});
