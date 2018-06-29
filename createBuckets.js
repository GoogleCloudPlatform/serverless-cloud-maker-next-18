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
Creates all missing buckets according to the defaults set in the fuction fiels
 */

const functions = require('./index').functions;
const StorageApi = require('@google-cloud/storage');
const storage = new StorageApi();


Promise.all(
    Object.keys(functions).map(
        (key) =>
            storage
                .bucket(functions[key].parameters.outputBucketName.defaultValue)
                .exists()
                .then(
                    ([exists]) =>
                        exists
                        ? Promise.resolve()
                        : storage
                            .bucket(functions[key].parameters.outputBucketName.defaultValue)
                            .create()
                            // return the name of the function so that we can log it
                            .then(() => functions[key].parameters.outputBucketName.defaultValue)
                )
    )
)
.then((results) =>
    results.filter(Boolean).length
    ? console.log('Created buckets:\n', results.filter(Boolean).join('\n'))
    : console.log('All default buckets exist')
)