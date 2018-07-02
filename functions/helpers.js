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


// Contains helpful methods that are called
// used by various functions.


const path = require('path');
const im = require('imagemagick')

const cropHintsToGeometry = (cropHintsAnnotation) => {
    const vertices = cropHintsAnnotation.cropHints[0].boundingPoly.vertices
    const xValues = vertices.map((vertex) => vertex.x)
    const yValues = vertices.map((vertex) => vertex.y)

    const xMax = Math.max(...xValues)
    const xMin = Math.min(...xValues)

    const yMax = Math.max(...yValues)
    const yMin = Math.min(...yValues)

    const width = xMax - xMin
    const height = yMax - yMin

    return `${width}x${height}+${xMin}+${yMin}`

    return [xMin, xMax, yMin, yMax]
}

const faceAnnotationToBoundingPoly = (faceAnnotation) => {
    const boundingPoly = faceAnnotation.boundingPoly
    const vertices = boundingPoly.vertices

    return vertices.map(({x, y}) => [x, y].join(',')).join(' ')
}

// creates a the name of the file to be used for the
// result of the function. Must be distrinct from the
// input file name
const createOutputFileName = (prefix = '', fileName) =>
    prefix
    // if a prefix was specified use that
    ? `${prefix}-${path.parse(fileName).base}`
    // otherwise append .out
    : `${path.parse(fileName).base}.out`

const createTempFileName = (fileName) => `/tmp/${path.parse(fileName).base}`

// Accept an array of arguments to be passed to imagemagick's convert method
// and return a promise the resolves when the transformation is complete.
const resolveImageMagickCommand = (cmd, args) =>
    new Promise(
        (resolve, reject) =>
            cmd(args, (err, result) => {
                if (err) {
                    console.error('ImageMagick command failed for arguments', args, err);
                    reject(err);
                    return
                } else {
                    console.log('ImageMagick command was successful.', args)
                    resolve(result)
                }
            })
    )

const resolveImageMagickIdentify = (args) => resolveImageMagickCommand(im.identify, args)

const resolveImageMagickConvert = (args) => resolveImageMagickCommand(im.convert, args)


const changeExtension = (fileName, extension) =>
    fileName.substr(0, fileName.lastIndexOf('.')) + extension

module.exports = {
    // imageMagickConvert,
    resolveImageMagickConvert,
    resolveImageMagickIdentify,
    resolveImageMagickCommand,
    // execImageMagickScript,
    cropHintsToGeometry,
    createOutputFileName,
    createTempFileName,
    faceAnnotationToBoundingPoly,
    changeExtension,
}


