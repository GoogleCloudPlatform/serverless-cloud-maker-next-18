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


const StorageApi = require('@google-cloud/storage');
const storage = new StorageApi();

const emojify = require('./emojify')
const emojis = emojify.emojis;

// Uploads all of the emojis contains in the assets folder to the relevant
// GCS bucket
['emojis-apple', 'emojis-google'].map((emojiSet) =>
    storage
        .bucket(emojiSet)
        .exists()
        // if the bucket does not exist, create it
        .then(([exists]) => exists ? Promise.resolve() : storage.bucket(emojiSet).create())
        .then(() =>
            Promise.all(
                // for each emoji in this set
                Object.keys(emojis).map((key) => {
                    // get the name of the file from the dictionary
                    const fileName = emojis[key]
                    const filePath = `./assets/${emojiSet}/${fileName}`
                    return storage
                        .bucket(emojiSet)
                        // upload it to the correct place in this bucket
                        .upload(filePath, {destination: fileName})
                        .then(() => console.log('Uploaded', fileName, 'to', emojiSet))
                })
            )
        )
)
