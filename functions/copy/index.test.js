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
// jest.mock("@google-cloud/storage")

// TODO: write a mock of the cloud storage api to enable testing the
// function itself.

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

});
