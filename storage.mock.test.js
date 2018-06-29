const StorageAPI = require("@google-cloud/storage")
jest.mock("@google-cloud/storage")

StorageAPI.prototype.bucket.mockReturnValue(new StorageAPI())
StorageAPI.prototype.file = jest.fn(() => new StorageAPI())

// const storage = new StorageAPI()



describe('when herpDerp', () => {
	it('should asdf', () => {
		// const storage = require("@google-cloud/storage")
		// conso/le.log(storage)

		const s = new StorageAPI()
		// console.log(s)
		// s.bucket.mockReturnValue(s)
		// console.log(s.bucket("asdf").file("yo"))
	});

});