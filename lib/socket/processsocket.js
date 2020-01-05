module.exports = function (io, config, pyRunner) {
	io.of(config.namespace).on("connection", function (socket) {
		console.log(`ProcessSocket - ${config.name} - ${socket.id}`);

		socket.on(config.processEvent, function (data) {
			console.log(`ProcessSocket - Process Event - RecordID: ${data.recordId}`);
			if (!data.recordId) {
				console.log("ProcessSocket - no Record ID");
			} else {
				pyRunner.initialize(data);
				pyRunner.execute();
			}
		});
	});
}
