
# Serverless Cloud Maker

This repository contains the source code for the backend of the Cloud Maker showcase for Google Cloud Next 2018. It uses Google Cloud Functions
on Node.js to implement a set of image transformation functions that combine the Google Cloud Vision API with ImageMagick to manipulate image data in interesting ways. 

It contains a handler function that can be deployed as a service to enable users to specify arbitrary combinations of functions to be applied to arbitrary image data.

## Setup

### Install Google Cloud SDK
- Install the `gcloud` command [here](https://cloud.google.com/sdk/install)
- Install the functions local emulator [here](https://cloud.google.com/functions/docs/emulator) to enable local testing

### Install global requirements
- Intsall ImageMagick: `brew install imagemagick`

### Install npm dependencies
- `cd serverless-cloud-maker-next-18 && npm install`


## Organization
- `index.js` implements the main handler function
- `example_request.json` shows an example of a request that the handler expects
- `example_response.json` shows an example of a response that the hander returns
- `functions` directory contains all of the functions, one per sub-directory

## Developing Locally
- Start the emulator `functions start`
- Deploy the handler to emulator the `functions deploy handler --trigger-http`
- Call the function with a test request stored in request.json: `functions call handler --data="$(cat request.json)"`
- Read the logs `functions logs read --limit=10`


## Running tests
- Run Jest: `jest` (or `npm run test`)
- Run Jest in watch mode: `jest --watch`

## Deploying to GCF
(All emulator commands can be prefixed with `gcloud` and exhibit the same behavior)

- Deploy the handler (1-2m): `gcloud functions deploy handler --trigger-http`
- Call the handler: `gcloud functions call handler --data=$(cat request.json)`
- Read the logs: `gcloud functions logs read --limit=10`

## Creating buckets
- Run `node createBuckets.js` to create all of the buckets that functions will upload results to by default.