const fs = require("fs");
const path = require("path");


module.exports = function Stream(recordDirectory, recordName) {
	this.baseDirectory = path.join(__dirname, "../../tmp/raw_data");
	this.recordDirectory = recordDirectory;
	this.recordName = recordName;
	this.recordPath = undefined;
	this.writeStream = undefined;

	this.initialize = function () {
		// create the record directory
		this.recordPath = path.join(this.baseDirectory, this.recordDirectory);
		if (!fs.existsSync(this.recordPath)) {
			fs.mkdirSync(this.recordPath, {
				recursive: true
			});
			console.log(`Stream - Record Directory Created: ${this.recordPath}`);
		} else {
			console.error(`Stream - Record Directory Already Exists: ${this.recordPath}`);
		}

		// create the stream
		if (!this.writeStream) {
			this.writeStream = fs.createWriteStream(path.join(this.recordPath, this.recordName));
			console.log(`Stream - Write Stream Created: ${this.recordName}`);
		} else {
			console.error(`Stream - Write Stream Already Exists: ${this.recordName}`);
		}
	};

	this.write = function (data, eol = "\n") {
		if (this.writeStream) {
			this.writeStream.write(data + eol);
		} else {
			console.error(`Stream - Unable to Write to Stream: ${this.recordPath}`);
		}
	};

	this.end = function () {
		if (this.writeStream) {
			this.writeStream.end();
			console.log(`Stream - Ended Stream: ${this.recordName}`);
		} else {
			console.error(`Stream - Unable to End Stream: ${this.writeStream} `);
		}
	};

	/**
	 * returns true and call successCallback if directory was deleted
	 */
	this.deleteEmptyDirectory = function (successCallback) {
		var recordPath = this.recordPath;
		if (fs.existsSync(recordPath)) {
			fs.readdir(recordPath, function (err, files) {
				if (err) {
					console.error(`Stream - Error in Reading Empty Directory: ${err}`);
					return false;
				}

				// directory is empty, so delete it
				if (files.length <= 0) {
					fs.rmdir(recordPath, function (error) {
						if (error) {
							console.error(`Stream - Error in Deleting Empty Directory: ${error}`);
							return false;
						}
						console.log(`Stream - Deleted Empty Directory: ${recordPath}`);
						successCallback();
						return true;
					});
				} else {
					console.log(`Stream - Directory is not empty ${recordPath} no action needed`);
					return false;
				}
			});
		}
	};

	/**
	 * returns true and call successCallback if directory was deleted
	 */
	this.deleteDirectory = function (successCallback) {
		var recordPath = this.recordPath;
		if (fs.existsSync(recordPath)) {
			fs.readdir(recordPath, function (err, files) {
				if (err) {
					console.error(`Stream - Error in Reading Directory: ${err}`);
					return false;
				}

				// delete directory
				fs.rmdir(recordPath, { recursive: true }, function (error) {
					if (error) {
						console.error(`Stream - Error in Deleting Directory: ${error}`);
						return false;
					}
					console.log(`Stream - Deleted Directory: ${recordPath}`);
					successCallback();
					return true;
				});
			});
		}
	}
};
