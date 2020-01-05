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

	startBpRecorder({
		recordId,
		duration,
		onStart: function () {
			console.log("Record Bos onStart");
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
			console.log("Record Bos onStop");
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
			console.log("Record Bos onProcess");
			io.connect("/socket/process/bos").emit("process-bos", { recordId });
		},
		onFinish: function () {
			console.log("Record Bos onFinish");
			postRecord("bos");
		}
	});
}

function onWaitingActiveIr() {
	showElement("ir-container", true);
	showElement("red-container", false);
	showElement("ir-waiting", true);
	showElement("ir-recording", false);
	showElement("ir-finished", false);
}

function onWaitingActiveRed() {
	showElement("red-container", true);
	showElement("red-waiting", true);
	showElement("red-recording", false);
	showElement("red-finished", false);
}

function onActiveIr() {
	showElement("ir-waiting", false);
	showElement("ir-recording", true);
}

function onActiveRed() {
	showElement("red-waiting", false);
	showElement("red-recording", true);
}

function onFinishedIr() {
	showElement("ir-recording", false);
	showElement("ir-finished", true);
}

function onFinishedRed() {
	showElement("red-recording", false);
	showElement("red-finished", true);
}

function onFinishedRecording() {
	showElement("recording-container", false);
	showElement("recording-finished", true);
	showElement("recording-button", false);
	showElement("record-container", true);
}

function new_onRecordBosClicked(e) {
	e.preventDefault();
	console.log("record bos");

	const settlingTime = 500;
	const durationUpdateTime = 1000;
	const finishedDelay = 100;
	var irRecorded = false;

	// change the recording ui elements
	showElement("record-container", false);
	showElement("recording-container", true);

	// start a new record
	var recordId = $(document.getElementById("recordId")).val();
	var irDuration = $(document.getElementById("duration")).val();
	var redDuration = irDuration;

	// declare sockets
	var ppgarmir = io.connect("/socket/ppgarm-ir");
	var ppgarmred = io.connect("/socket/ppgarm-red");


	onWaitingActiveIr();
	ppgarmir.on("active-led", function (data) {
		if (irDuration > 0) {
			// delay for "settlingTime" ms to allow light to settle down
			setTimeout(() => {
				console.log(`Start Recording IR for ${irDuration} seconds`);
				onActiveIr();
				ppgarmir.emit("record-ppgarm-ir", {
					startRecording: true,
					recordId
				});

				var irTimeLeft = $(document.getElementById("ir-timeLeft"));
				irTimeLeft.text(irDuration + "s");

				var updateIrInterval = setInterval(() => {
					// update irDuration
					irDuration--;
					irTimeLeft.text(irDuration + "s");

					// check if finished
					if (irDuration <= 0) {
						setTimeout(() => {
							// Finished Recording PPG IR
							console.log("Stop Recording IR");
							onFinishedIr();
							ppgarmir.emit("record-ppgarm-ir", {
								stopRecording: true,
								recordId
							});
							ppgarmir.close();
							irRecorded = true;

							// Wait for PPG Red to be active and recorded
							onWaitingActiveRed();

							clearInterval(updateIrInterval);
						}, finishedDelay);
					}
				}, durationUpdateTime);
			}, settlingTime);
		}
	});

	ppgarmred.on("active-led", function (data) {
		console.log(`Ir Recorded: ${irRecorded}`);
		if (!irRecorded) { return; }
		if (redDuration > 0) {
			// delay for "settlingTime" ms to allow light to settle down
			setTimeout(() => {
				console.log(`Start Recording RED for ${redDuration} seconds`);
				onActiveRed();
				ppgarmred.emit("record-ppgarm-red", {
					startRecording: true,
					recordId
				});

				var redTimeLeft = $(document.getElementById("red-timeLeft"));
				redTimeLeft.text(redDuration + "s");

				var updateIrInterval = setInterval(() => {
					// update redDuration
					redDuration--;
					redTimeLeft.text(redDuration + "s");

					// check if finished
					if (redDuration <= 0) {
						setTimeout(() => {
							// Finished Recording PPG Red
							console.log("Stop Recording Red");
							onFinishedRed();
							ppgarmred.emit("record-ppgarm-red", {
								stopRecording: true,
								recordId
							});
							ppgarmred.close();

							// Time to process 2 signals
							console.log("onProcess Bos Recording");
							io.connect("/socket/process/bos").emit("process-bos", { recordId });

							// Finished Recording 2 signals
							onFinishedRecording();
							console.log("onFinish Bos Recording");
							postRecord("bos");

							clearInterval(updateIrInterval);
						}, finishedDelay);
					}
				}, durationUpdateTime);
			}, settlingTime);
		}
	});
}


$(function () {
	showElement("recording-container", false);
	showElement("recording-finished", false);

	// add the events for record button clicks
	var recordBos = document.getElementById("recordBos");
	recordBos.addEventListener("click", new_onRecordBosClicked);
});
