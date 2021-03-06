function startBpRecorder(config) {
	var recordId = config.recordId;
	var duration = parseInt(config.duration);

	if (duration > 0) {
		// call the onStart callback
		config.onStart();

		// update the duration text
		var timeLeft = $(document.getElementById(config.timeLeft));
		timeLeft.text(duration + "s");

		var updateInterval = setInterval(() => {
			// update duration
			duration--;
			timeLeft.text(duration + "s");

			// check if finished
			if (duration <= 0) {
				setTimeout(() => {

					// stop recording then process the data recorded
					config.onStop();
					config.onProcess();

					showElement("recording-container", false);
					showElement("recording-finished", true);
					showElement("recording-button", false);
					showElement("record-container", true);

					// to avoid duplicate recording intervals
					clearInterval(updateInterval);

					config.onFinish();
				}, 100);
			}
		}, 1000);
	}
}

function onWaitingActiveIr() {
	showElement("arm-container", true);
	showElement("leg-container", false);
	showElement("arm-waiting", true);
	showElement("arm-recording", false);
}

function onActiveIr() {
	showElement("arm-waiting", false);
	showElement("arm-recording", true);
}

function onRecordArmClicked(e) {
	e.preventDefault();
	console.log("record arm");
	const settlingTime = 500;

	// change the recording ui elements
	showElement("record-container", false);
	showElement("recording-container", true);

	// start a new record
	var recordId = $(document.getElementById("recordId")).val();
	var duration = $(document.getElementById("duration")).val();

	// declare sockets
	var ecg = io.connect("/socket/ecg");
	var ppgarmir = io.connect("/socket/ppgarm-ir");

	onWaitingActiveIr();

	ppgarmir.on("active-led", function (data) {
		setTimeout(() => {
			startBpRecorder({
				recordId,
				duration,
				timeLeft: "arm-timeLeft",
				onStart: function () {
					console.log("Record Bos onStart");
					onActiveIr();
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
					console.log("Record Bos onStop");
					ecg.emit("record-ecg", {
						stopRecording: true,
						recordId
					});
					ecg.close();

					ppgarmir.emit("record-ppgarm-ir", {
						stopRecording: true,
						recordId
					});
					ppgarmir.close();
				},
				onProcess: function () {
					console.log("Record Bos onProcess");
					io.connect("/socket/process/bparm").emit("process-bparm", { recordId, duration });
				},
				onFinish: function () {
					console.log("Record Bos onFinish");
					postRecord("bparm");
				}
			});
		}, settlingTime);
	});
}

function onRecordLegClicked(e) {
	e.preventDefault();
	console.log("record leg");

	// change the recording ui elements
	showElement("record-container", false);
	showElement("recording-container", true);
	showElement("arm-container", false);
	showElement("leg-container", true);

	// start a new record
	var recordId = $(document.getElementById("recordId")).val();
	var duration = $(document.getElementById("duration")).val();

	// declare sockets
	var ecg = io.connect("/socket/ecg");
	var ppgleg = io.connect("/socket/ppgleg");

	startBpRecorder({
		recordId,
		duration,
		timeLeft: "leg-timeLeft",
		onStart: function () {
			console.log("Record Bos onStart");
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
			console.log("Record Bos onStop");
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
			console.log("Record Bos onProcess");
			io.connect("/socket/process/bpleg").emit("process-bpleg", { recordId, duration });
		},
		onFinish: function () {
			console.log("Record Bos onFinish");
			postRecord("bpleg");
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
	recordLeg.addEventListener("click", onRecordLegClicked);
});
