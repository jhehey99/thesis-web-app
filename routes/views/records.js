const express = require("express");
const router = express.Router();
const path = require("path");

/**
 * View list of records
 */
router.get("/", function (req, res) {
	res.html("records/records-list");
});

/**
 * View single record
 */
router.get("/:recordId(\\w+)/", function (req, res) {
	res.html("records/view-record");
});


/**
 * Send the figures given the recordId as param and figureName as query string
 */
router.get("/:recordId/results", function (req, res) {
	var recordId = req.params.recordId;
	var figureName = req.query.figureName;

	const figuresPath = path.resolve(__dirname, `../../tmp/py_results/${recordId}/${figureName}.svg`);
	console.log(`Records GET - recordId: ${recordId}, figureName: ${figureName}`);
	console.log(figuresPath);

	res.sendFile(figuresPath);
});

router.get("/delete/:recordId(\\w+)/", function (req, res) {
	res.html("records/delete-record");
});

router.get("/reprocess/:recordId", function (req, res) {

	var recordId = req.params.recordId;
	var recordType = req.query.recordType;
	data = { recordId, duration: 8 };

	console.log(`Reprocessing: ${data}`);

	/* Python Config */
	const pyConfig = require("../../config/pyrunner");
	const PyRunner = require("../../lib/py/pyrunner");

	const pyRunner = new PyRunner(pyConfig[recordType]);
	pyRunner.initialize(data);
	pyRunner.execute();

	res.redirect("/records");
});


module.exports = router;
