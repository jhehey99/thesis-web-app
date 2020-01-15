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
	console.log(req.query);

	var searchQuery = req.query.query;
	var searchParam = req.query.param;
	var pageSize = parseInt(req.query.pageSize);
	var pageNumber = parseInt(req.query.pageNumber);

	var obj = {};
	if (searchQuery != 'null' && searchParam != 'null') {
		obj[searchParam] = { $regex: '.*' + searchQuery + '.*' };
	}

	if (searchParam == "recordId" || searchParam == 'null') {
		Record.find(obj)
			.limit(pageSize)
			.skip(pageSize * (pageNumber - 1))
			.populate({ path: "accountId", select: "username name age" })
			.exec(function (err, records) {
				if (err) { console.error(err); return res.json(err); }
				return res.json(records);
			});
	} else {
		Account.find(obj).select("_id").exec(function (err, accounts) {
			if (err) { console.error(err); return res.json(err); }
			if (accounts.length <= 0) { return res.json([]); }

			Record.find({ accountId: { $in: accounts } })
				.limit(pageSize)
				.skip(pageSize * (pageNumber - 1))
				.populate({ path: "accountId", select: "username name age" })
				.exec(function (err, records) {
					if (err) { console.error(err); return res.json(err); }
					return res.json(records);
				});
		});
	}
});

/**
 * Get All Records based on Record Type
 */
router.get("/type/:recordType", function (req, res) {
	var recordType = req.params.recordType;
	console.log(`Records GET - Get records by recordType: ${recordType}`);
	Record.find({ recordType: recordType })
		.populate({ path: "accountId", select: "username name" })
		.exec(function (err, records) {
			if (err) { console.error(err); return res.json(err); }
			return res.json(records);
		});
});

/**
 * Get Record given the recordId as parameter
 */
router.get("/:recordId(\\w+)/", function (req, res) {
	var recordId = req.params.recordId;
	console.log(`Records GET - Get record by recordId: ${recordId}`);
	Record.findOne({ recordId: recordId })
		.populate({ path: "accountId", select: "username name age" })
		.exec(function (err, record) {
			if (err) { console.error(err); return res.json(err); }
			return res.json(record);
		});
});


/**
 * Delete Record given the recordId as parameter
 */
router.post("/delete/:recordId(\\w+)/", function (req, res) {
	var recordId = req.params.recordId;
	console.log(`Records DELETE - Delete record by recordId: ${recordId}`);
	Record.deleteOne({ recordId: recordId }, function (err) {
		if (err) { console.error(err); return res.json(err); }
		return res.json({ success: true, message: "Record Deleted" });
	});
});

/**
 * Get latest record data
 */
router.get("/etc/latest", function (req, res) {
	console.log("Records GET - Get latest record");
	Record.findOne()
		.sort({ dateRecorded: -1 })
		.populate({ path: "accountId", select: "username name age" })
		.exec(function (err, record) {
			if (err) { console.error(err); return res.json(err); }
			return res.redirect(`/records/${record.recordId}`);
		});
});

/**
 * Get total count of records
 */
router.get("/etc/count", function (req, res) {
	console.log("Records GET - Get total count of records");

	var searchQuery = req.query.query;
	var searchParam = req.query.param;

	var obj = {};
	if (searchQuery != 'null' && searchParam != 'null') {
		obj[searchParam] = searchQuery;
	}

	if (searchParam == "recordId" || searchParam == 'null') {
		Record.find(obj)
			.countDocuments()
			.exec(function (err, count) {
				if (err) { console.error(err); return res.json({ count: 0 }); }
				return res.json(count);
			});
	} else {
		Account.find(obj).select("_id").exec(function (err, accounts) {
			if (err) { console.error(err); return res.json(err); }
			if (accounts.length <= 0) { return res.json([]); }

			Record.find({ accountId: { $in: accounts } })
				.countDocuments()
				.exec(function (err, count) {
					if (err) { console.error(err); return res.json({ count: 0 }); }
					return res.json(count);
				});
		});
	}
});

/**
 * Get a new and unique record id
 */
router.get("/etc/newRecordId", function (req, res) {
	var recordId = uniqid().split("").reverse().join("");
	console.log(`Records GET - Generate new record id: ${recordId}`);
	res.json({ recordId });
});

/**
 * Helper function for new records
 */
function saveRecord(record, account, res) {
	record.accountId = account._id;
	record.save(function (err, rec) {
		if (err) return console.error(err);
		console.log(`Records POST - /records/new - Record saved - recordId: ${rec.recordId} to ${account.username}`);
		return res.json({
			message: "Record Saved"
		});
	});
}

/**
 * Create a new record, along with account info
 */
router.post("/new", function (req, res) {
	console.log("Records POST - New Record");
	const pyConfig = require("../../config/pyrunner");
	var recordType = req.body.record.recordType;
	var recordConfig = pyConfig[recordType];

	var account = new Account(req.body.info);
	var record = new Record({
		accountId: account._id,
		recordId: req.body.record.recordId,
		recordType: recordType,
		title: recordConfig.title,
		figureNames: recordConfig.figureNames,
		dateRecorded: Date.now()
	});

	Account.findOne({
		username: account.username
	}, function (err, foundAccount) {
		if (err) return console.error(err);

		// no account found, we save the new account then save the record
		if (foundAccount == null) {
			account.save(function (err, savedAccount) {
				if (err) return console.error(err);
				console.log(`Records POST - /records/new - New Account Saved with username: ${savedAccount.username}, name: ${savedAccount.name}`);
				return saveRecord(record, savedAccount, res);
			});
		} else {
			if (foundAccount.name != account.name || foundAccount.age != account.age) {
				// if found, but different name or age, we update the name or age, then save the record
				foundAccount.update({ name: account.name, age: account.age }, function (err) {
					if (err) return console.error(err);
					console.log(`Records POST - /records/new - Updated Account with username: ${foundAccount.username}`);
					return saveRecord(record, foundAccount, res);
				})
			} else {
				// found an existing account, so just save the record
				console.log(`Records POST - /records/new - Found Existing Account with username: ${foundAccount.username}`);
				return saveRecord(record, foundAccount, res);
			}
		}
	});
});

module.exports = router;
