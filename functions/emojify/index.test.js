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
const transformApplyEmojify = require('./index.js')

jest.mock('../helpers.js')
const helpers = require('../helpers')

jest.mock('@google-cloud/vision').v1p2beta1;
jest.mock('@google-cloud/storage')

describe('when transformApplyEmojify is called', () => {

    it('should have default parameters', () => {
        expect(transformApplyEmojify.parameters).not.toBeUndefined()
    });
});
