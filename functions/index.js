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

// assemble all of the functions built in this directory into a single export

// simple functions
const copyImage = require('./copy');
const convertRasterFormat = require('./convertRasterFormat');
// basic transformations
const resizeTransform = require('./resize');
const rotateTransform = require('./rotate');
const reflectTransform = require('./reflect');
const filterTransform = require('./filter');
const borderTransform = require('./border');
const blurTransform = require('./blur');
// vision transformations
const captionTransform = require('./caption');
const blurFacesTransform = require('./faces');
const cropShapeTransform = require('./shape');
const safeSearchTransform = require('./safeSearch');
const emojiTransform = require('./emojify');
const blurLogosTransform = require('./logo');
const landmarkTransform = require('./landmarks');
const dogeTransform = require('./doge');
// helpers
const helpers = require('./helpers');


module.exports = {
    // basic functions
    copyImage,
    convertRasterFormat,
    // basic transformations
    resizeTransform,
    rotateTransform,
    reflectTransform,
    filterTransform,
    borderTransform,
    blurTransform,
    // vision transformations
    captionTransform: dogeTransform,
    landmarkTransform,
    blurFacesTransform,
    blurLogosTransform,
    cropShapeTransform,
    safeSearchTransform,
    emojiTransform,
    dogeTransform,
    // helpers
    helpers,
};
