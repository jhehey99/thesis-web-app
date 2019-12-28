const uniqid = require("uniqid");
const express = require("express");
const router = express.Router();
const Account = require("../../models/account");
const Record = require("../../models/record");


/**
 * Get all records
 */
router.get("/", function (req, res) {
	//TODO AUSIN UNG DISPLAY
	console.log("Records GET - Get all records");
	Record.find(function (err, docs) {
		if (err) return console.error(err);
	}).then(function (docs) {
		res.json(docs);
	});
});

/**
 * Get a new and unique record id
 */
router.get("/newRecordId", function (req, res) {
	var recordId = uniqid().split("").reverse().join("");
	console.log(`Records GET - Generate new record id: ${recordId}`);
	res.json({
		recordId
	});
});

/**
 * Create a new record, along with account info
 */
router.post("/new", function (req, res) {
	console.log("Records POST - New Record");

	var account = new Account(req.body.info);
	var record = new Record({
		accountId: account._id,
		recordId: req.body.record.recordId,
		dateRecorded: Date.now()
	});

	Account.find({
		username: account.username
	}, function (err, doc) {
		if (err) return console.error(err);

		if (doc.length <= 0) {
			account.save(function (err, doc) {
				if (err) return console.error(err);
				console.log("Records POST - /records/new - Account saved");
			});
		} else {
			console.log("Records POST - /records/new - Account exists");
		}
	}).then(function (doc) {
		record.save(function (err, doc) {
			if (err) return console.error(err);
			console.log("Records POST - /records/new - Record saved");
		});
	});

	res.json({
		message: "Account and Record saved"
	});
});

module.exports = router;
