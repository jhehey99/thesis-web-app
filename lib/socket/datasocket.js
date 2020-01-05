const Record = require("../../models/record");
var Stream = require("./stream");


module.exports = function (io, config) {
	var recording = false;
	var stream = undefined;
	var recordId = undefined;

	var deleteRecord = function (id) {
		console.log(`DataSocket - Delete Record - recordId: ${id}`);
		if (id) {
			Record.findOneAndDelete({
				recordId: id
			}, function (err, doc) {
				if (err) return console.error(err);
				console.log(`DataSocket - Delete Record Success - recordId: ${id}`);
			});
		}
	}

	var stopRecording = function (failedRecord) {
		console.log(`DataSocket - Stop Recording - Failed: ${failedRecord} - ${config.name}`);
		recording = false;

		// end the write stream
		if (stream) {
			stream.end();

			if (failedRecord === true) {
				stream.deleteDirectory(function () {
					deleteRecord(recordId);
				});
			} else {
				stream.deleteEmptyDirectory(function () {
					deleteRecord(recordId);
				});
			}
		} else {
			console.log(`DataSocket - Stream ${config.name} is undefined`);
		}
	}

	/* IO Socket */
	console.log(`DataSocket - ${config.name}`);
	io.on("connection", function (socket) {

		socket.on("disconnect", function (reason) {
			console.log(`DataSocket - Disconnected ${config.name} due to ${reason}`);

			if (recording) {
				stopRecording(true);
			}
		});

		socket.on(config.rawDataEvent, function (data) {
			// console.log(`DataSocket - ${config.rawDataEvent} - ${data}`);

			var splitted = data.split(",");
			var address = splitted[0];
			var value = splitted[1];
			var time = Date.now();
			var entry = `${time},${value}`;

			// raw data is being recorded, save to file
			if (recording && stream) {
				stream.write(entry);
			}

			// display the data to the client
			io.of(config.namespace).emit(config.displayEvent, { time, value });
		});
	});

	io.of(config.namespace).on("connection", function (socket) {

		socket.on("connect", function (data) {
			console.log(`DataSocket - Connection of ${config.name} to ${socket.id}`);
		});

		socket.on(config.recordEvent, function (data) {
			console.log(`DataSocket - Record ${config.name}`, data);
			if (!recording && data.startRecording) {
				console.log(`DataSocket - Start Recording - ${config.name}`);
				recording = true;
				recordId = data.recordId;

				// create the stream object
				stream = new Stream(data.recordId, config.recordName);
				stream.initialize();
			} else if (data.stopRecording) {
				stopRecording(false);
			}
		});
	});
};
