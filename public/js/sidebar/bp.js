function onRecordArmClicked(e) {
	e.preventDefault();
	console.log("record arm");

	// change the recording ui elements
	showElement("record-container", false);
	showElement("recording-container", true);

	// start a new record
	var recordId = $(document.getElementById("recordId")).val();
	var duration = $(document.getElementById("duration")).val();

	// declare sockets
	var ecg = io.connect("/socket/ecg");
	var ppgarmir = io.connect("/socket/ppgarm-ir");

	startRecorder({
		recordId,
		duration,
		onStart: function () {
			ecg.emit("record-ecg", {
				startRecording: true,
				recordId
			});
			ppgarmir.emit("record-ppgarm-ir", {
				startRecording: true,
				recordId
			});
		},
		onStop: function () {
			ecg.emit("record-ecg", {
				stopRecording: true,
				recordId
			});
			ecg.close();
			console.log("ecg stopped");

			ppgarmir.emit("record-ppgarm-ir", {
				stopRecording: true,
				recordId
			});
			ppgarmir.close();
			console.log("ppgarmir stopped");
		},
		onProcess: function () {
			io.connect("/socket/process/bparm").emit("process-bparm", { recordId });
		},
		onFinish: function () {
			postRecord();
		}
	});
}

function onRecordLegClicked(e) {
	e.preventDefault();
	console.log("record leg");

	// change the recording ui elements
	showElement("record-container", false);
	showElement("recording-container", true);

	// start a new record
	var recordId = $(document.getElementById("recordId")).val();
	var duration = $(document.getElementById("duration")).val();

	// declare sockets
	var ecg = io.connect("/socket/ecg");
	var ppgleg = io.connect("/socket/ppgleg");

	startRecorder({
		recordId,
		duration,
		onStart: function () {
			ecg.emit("record-ecg", {
				startRecording: true,
				recordId
			});
			ppgleg.emit("record-ppgleg", {
				startRecording: true,
				recordId
			});
		},
		onStop: function () {
			ecg.emit("record-ecg", {
				stopRecording: true,
				recordId
			});
			ecg.close();

			ppgleg.emit("record-ppgleg", {
				stopRecording: true,
				recordId
			});
			ppgleg.close();
		},
		onProcess: function () {
			io.connect("/socket/process/bpleg").emit("process-bpleg", { recordId });
		},
		onFinish: function () {
			postRecord();
		}
	});
}

$(function () {
	showElement("recording-container", false);
	showElement("recording-finished", false);

	// add the events for record button clicks
	var recordArm = document.getElementById("recordArm");
	recordArm.addEventListener("click", onRecordArmClicked);

	var recordLeg = document.getElementById("recordLeg");
	recordLeg.addEventListener("click", onRecordArmClicked);
});
