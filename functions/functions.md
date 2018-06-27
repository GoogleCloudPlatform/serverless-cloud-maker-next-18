# Functions
This file lists all of the functions that are implemented by this director, as well as the parameters that they accept.

### Universal Parameters
All functions accept two parameters to control what they do with their output

`outputBucketName`: The name of the bucket to upload the result to.

`outputPrefix`: An optional prefix to add to the file name to indicate that this function was successfully applied.

## copyImage
Creates a copy of the image and uploads it to an output bucket.
