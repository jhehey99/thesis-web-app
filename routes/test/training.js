const express = require("express");
const router = express.Router();
const PyTrainer = require("../../lib/py/pytrainer");
const uniqid = require("uniqid");

router.get("/", function (req, res) {
	res.html("training/training");
});

router.post("/train", function (req, res) {
	console.log(`Training POST - Train`);

	var recordType = req.body.recordType;
	var trainingId = uniqid();
	console.log(recordType);
	if (recordType == "bos") {
		var bos = req.body.bos;
		bos.trainingType = "bos"
		bos.trainingId = trainingId;
		bos.title = "Blood Oxygen Saturation";
		console.log(bos);
		const bosTrainer = new PyTrainer();
		bosTrainer.train(recordType, bos);
	} else {
		// Sysytolic Blood Pressure
		var systolic = req.body.systolic;
		systolic.trainingType = "systolic"
		systolic.trainingId = trainingId;
		systolic.title = "Systolic Blood Pressure";
		console.log(systolic);
		const systolicTrainer = new PyTrainer();
		systolicTrainer.train(recordType, systolic);

		// Diastloc Blood Pressure
		var diastolic = req.body.diastolic;
		diastolic.trainingType = "diastolic"
		diastolic.trainingId = trainingId;
		diastolic.title = "Diastolic Blood Pressure";
		console.log(diastolic);
		const diastolicTrainer = new PyTrainer();
		diastolicTrainer.train(recordType, diastolic);

		// TODO: .train() -> returns properties then send html from here with the figures of training
	}

	res.json("ok");
});

module.exports = router
