// create necessary mocks of storage client library
jest.mock('@google-cloud/storage');
const StorageAPI = require('@google-cloud/storage');
StorageAPI.prototype.bucket = jest.fn(() => new StorageAPI());
StorageAPI.prototype.upload = jest.fn(() => Promise.resolve());
StorageAPI.prototype.file = jest.fn(() => new StorageAPI());

// create mocks of helper functions
jest.mock('./helpers');
const helpers = require('./helpers');

// unmocked module imports
const decorator = require('./decorator');
const fs = require('fs');

const outputBucketName = 'outputBucketName';
const outputPrefix = 'outputPrefix';
const outputFileName = 'outputFileName';
const name = 'name';
const file = {
    name,
    download: jest.fn(() => Promise.resolve()),
};
const transform = jest.fn(() => Promise.resolve());
const parameters = {
    outputBucketName,
    outputPrefix,
};

describe('when createImageMagickTransform is used', () => {
    it('should return a function', () => {
        const decoratedTransform = decorator(transform);
        expect(typeof decoratedTransform).toBe('function');
    });


    it('should create a temp output file', () => {
        const decoratedTransform = decorator(transform);

        helpers.createOutputFileName.mockReturnValue(outputFileName);
        decoratedTransform(file, parameters);
        expect(helpers.createOutputFileName).toHaveBeenCalledWith(name, {outputPrefix, outputBucketName});
        expect(helpers.createTempFileName).toHaveBeenCalledWith(name);
        expect(helpers.createTempFileName).toHaveBeenCalledWith(outputFileName);
    });

    it('should download the file if it not present in memory', () => {
        const decoratedTransform = decorator(transform);
        file.download.mockClear();
        decoratedTransform(file, parameters);
        expect(file.download).toHaveBeenCalled();
    });

    it('should not download the file if it is present in memory', () => {
        helpers.createTempFileName.mockReturnValue(outputFileName);
        file.download.mockClear();
        fs.writeFileSync(outputFileName, 'foo');
        const decoratedTransform = decorator(transform);
        decoratedTransform(file, parameters);
        expect(file.download).not.toHaveBeenCalled();
    });

    it('should pass the inFile, outFile, and parameters to the transform', () => {
        transform.mockClear();
        helpers.createTempFileName.mockReturnValue(outputFileName);
        const decoratedTransform = decorator(transform);
        decoratedTransform(file, parameters).then(() => expect(transform).toHaveBeenCalledWith(outputFileName, outputFileName, parameters));
    });
});
