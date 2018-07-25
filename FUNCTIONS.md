# Cloud Maker Functions and Parameters
This document contains the final list of Cloud Maker functions and all of the parameters they accept.

__DISCLAIMER__: This is not an official Google Product.

# Functions

## copyImage
Creates a copy of the image.

## convertRasterFormat
Converts the image to the desired image format (jpg, png, or gif)

### `extension`
- Determines the format the image will be converted to
- Default: ".png"
- Options: [".png", ".jpg", ".gif"]


## blurTransform
Blurs the image.

## safeSearchTransform
Blurs the image if it is marked as unsafe by the Cloud Vision `safeSearchDetection` method.

## blurFacesTransform
Detects all faces in the image using the Cloud Vision API and blurs them.

## emojiTransform
Detects all faces and their emotions in the image using the Cloud Vision API and replaces each face with its corresponding emoji.

### emojiSet
- Determines the set of emojis that are used in the transformation
- Options: ['emojis-apple', 'emojis-g']
- Default: 'emojis-g'

## dogeTransform
Uses the labelDetection api to generate a set of labels and scatter them as Google-colored doge-ified captions.

## blurLogosTransform
Detects all logos using the Cloud Vision API and blurs them.

## landmarkTransform
Detects all landmarks in the image using the Cloud Vision API and applies a caption with the name of the landmark.


## borderTransform
Adds a border of the desired color and width to the image.

### `color`
- Determines the color of the border that is added to the image. If not set will choose a random Google color.
- Options: ['blue', 'green', 'yellow', 'red'] (Google colors)
- Default: null (random)

### `width`
- Determines the width of the border added to the image as a percent of the image's dimensions.
- Options: [1: 100]
- Default: 1


## captionTransform
Adds a caption to the image, either the one specified by the user or the one suggested by the Cloud Vision API.

### `caption`
- If set, determines the caption that is applied to the image. If not set, uses suggestions from the cloud vision api.
- Default: false 
- Options: [false, any string]

### `color`
- If set, determines the color of the caption applied to the image. If not set, the function will choose a random Google color.
- Default: null (random)
- Options: ['blue', 'green', 'yellow', 'red'] (Google Colors)

## filterTransform
Applies a filter to the image, either sepia, grayscale, or a random tint (colorize)

### `filterName`
- Determines the filter that will be applied to the image
- Default: "sepia"
- Options: ['sepia', 'grayscale', 'colorize']


## resizeTransform
Resizes the image to the desired size.

### `width`
- Default: 200
- Options: Any integer

### `height`
- Default: 200
- Options: Any integer


## rotateTransform
Rotates the image any number of degrees.

### `degrees`
- Default: 90
- Accepts: Any integers


## reflectTransform
Reflects the image vertically or horizontally.

### `axis`
- Determines the axis to reflect the image across
- Default: y
- Accepts: [x, y]


## cropShapeTransform

Crops the image into a circle, a square, or into the rectangle suggested by the Cloud Vision API.

### `shape`
- Determines the shape to crop the image into. By default applies suggestions from the cropHints endpoint of the cloud vision api. Cropping into a circle requires converting to a PNG.
- default: "suggested"
- accepts: ["square", "circle", "suggested"]


# Global Parameters
These parameters are accepted by all functions.

### `outputBucketName`
- Determines the bucket that results of this function are uploaded to. 
- Options: Any string. The function assumes that the bucket exists, and I have a script to create any missing buckets.
- Example: `{ "outputBucketName": "cloud-maker-outputs" }`

### `outputPrefix`
- Determines the prefix that is prepended to image files that have had this function applied to them.
- Options: Accepts any string, including the empty string.
- Example: `{ "outputPrefix": "cropped"}`


# Example Request

```
{
  "data": {
    "bucket": "inputs",
    "name": "image1.jpg"
  },
  "outputBucketName": "outputs",
  "functions": [
    {
      "name": "copyImage",
      "parameters": {
        "outputBucketName": "outputs-copied"
      }
    }
  ]
}
```


# Example Response

```
{
  "bucket": {
    "name": "outputs",
    "storage": {},
    "acl": {
      "owners": {},
      "readers": {},
      "writers": {},
      "pathPrefix": "/acl",
      "default": {}
    },
    "iam": {
      "resourceId_": "buckets/outputs"
    }
  },
  "storage": {},
  "name": "copied-image1.jpg",
  "acl": {
    "owners": {},
    "readers": {},
    "writers": {},
    "pathPrefix": "/acl"
  }
}
```