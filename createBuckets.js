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
Creates all missing buckets according to the defaults set in the function fields
 */

require('dotenv').config();
const StorageApi = require('@google-cloud/storage');
const storage = new StorageApi();

const buckets = [
    process.env.OUTPUT_BUCKET,
];

if (!process.env.OUTPUT_BUCKET) {
    throw 'process.env.OUTPUT_BUCKET not set';
}
console.log('Output bucket set to', process.env.OUTPUT_BUCKET);


buckets.forEach(
    (bucket) =>
        storage
            .bucket(bucket)
            .exists()
            .then(
                ([exists]) =>
                    exists
                    ? Promise.resolve()
                    : storage
                        .bucket(bucket)
                        .create()
                        .then(() => console.log('Created', bucket))
            )
);
