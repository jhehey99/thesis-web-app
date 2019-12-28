function startRecorder(config) {
	var recordId = config.recordId;
	var duration = parseInt(config.duration);

	if (duration > 0) {
		// call the onStart callback
		config.onStart();

		// update the duration text
		var timeLeft = $(document.getElementById("timeLeft"));
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
					showElement("record-container", true);

					// to avoid duplicate recording intervals
					clearInterval(updateInterval);

					config.onFinish();
				}, 100);
			}
		}, 1000);
	}
}
