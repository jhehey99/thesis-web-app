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
router.get("/:recordId", function (req, res) {
	res.html("records/view-record");
});


/**
 * Send the figures given the recordId as param and figureName as query string
 */
router.get("/:recordId/figs", function (req, res) {
	var recordId = req.params.recordId;
	var figureName = req.query.figureName;

	const figuresPath = path.resolve(__dirname, `../../tmp/py_figs/${recordId}/${figureName}.svg`);
	console.log(`Records GET - recordId: ${recordId}, figureName: ${figureName}`);
	console.log(figuresPath);

	res.sendFile(figuresPath);
});

module.exports = router;
