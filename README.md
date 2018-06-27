
# Serverless Cloud Maker

This repository contains the source code for the backend of the Cloud Maker showcase for Google Cloud Next 2018. It uses Google Cloud Functions
on Node.js to implement a set of image transformation functions that combine the Google Cloud Vision API with ImageMagick to manipulate image data in interesting ways. 

It contains a handler function that can be deployed as a service to enable users to specify arbitrary combinations of functions to be applied to arbitrary image data.

## Setup

Clone the repository
`git clone git@github.com:GoogleCloudPlatform/serverless-cloud-maker-next-18.git`

Install dependencies
`cd serverless-cloud-maker-next-18`
`npm install`

Install gcloud and functions emulator

Install jest to run tests
`npm install -g jest`



