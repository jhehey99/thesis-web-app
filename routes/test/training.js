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
		bos.ylim = null;
		console.log(bos);
		const bosTrainer = new PyTrainer();
		bosTrainer.train(recordType, bos);
	} else {
		// Sysytolic Blood Pressure
		var systolic = req.body.systolic;
		systolic.trainingType = "systolic"
		systolic.trainingId = trainingId;
		// systolic.title = `${(recordType == "bparm" ? "Arm" : "Leg")} Systolic Blood Pressure`;
		systolic.title = "Systolic Blood Pressure";
		systolic.ylim = recordType == "bparm" ? { bottom: 90, top: 150 } : { bottom: 100, top: 160 }
		console.log(systolic);
		const systolicTrainer = new PyTrainer();
		systolicTrainer.train(recordType, systolic);

		// Diastloc Blood Pressure
		var diastolic = req.body.diastolic;
		diastolic.trainingType = "diastolic"
		diastolic.trainingId = trainingId;
		// diastolic.title = `${(recordType == "bparm" ? "Arm" : "Leg")} Diastolic Blood Pressure`;
		diastolic.title = "Diastolic Blood Pressure";
		diastolic.ylim = recordType == "bparm" ? { bottom: 40, top: 120 } : { bottom: 40, top: 120 }
		console.log(diastolic);
		const diastolicTrainer = new PyTrainer();
		diastolicTrainer.train(recordType, diastolic);

		// TODO: .train() -> returns properties then send html from here with the figures of training
	}

	res.json("ok");
});

module.exports = router
