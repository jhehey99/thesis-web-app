function onRecordBosClicked(e) {
	e.preventDefault();
	console.log("record bos");

	// change the recording ui elements
	showElement("record-container", false);
	showElement("recording-container", true);

	// start a new record
	var recordId = $(document.getElementById("recordId")).val();
	var duration = $(document.getElementById("duration")).val();

	// declare sockets
	var ppgarmir = io.connect("/socket/ppgarm-ir");
	var ppgarmred = io.connect("/socket/ppgarm-red");

	startRecorder({
		recordId,
		duration,
		onStart: function () {
			ppgarmir.emit("record-ppgarm-ir", {
				startRecording: true,
				recordId
			});
			ppgarmred.emit("record-ppgarm-red", {
				startRecording: true,
				recordId
			});
		},
		onStop: function () {
			ppgarmir.emit("record-ppgarm-ir", {
				stopRecording: true,
				recordId
			});
			ppgarmir.close();

			ppgarmred.emit("record-ppgarm-red", {
				stopRecording: true,
				recordId
			});
			ppgarmred.close();
		},
		onProcess: function () {
			io.connect("/socket/process/bos").emit("process-bos", { recordId });
		},
		onFinish: function () {
			postRecord("bos");
		}
	});
}

$(function () {
	showElement("recording-container", false);
	showElement("recording-finished", false);

	// add the events for record button clicks
	var recordBos = document.getElementById("recordBos");
	recordBos.addEventListener("click", onRecordBosClicked);
});
