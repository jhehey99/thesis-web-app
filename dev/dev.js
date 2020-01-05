const express = require("express");
const router = express.Router();
const Account = require("../models/account");
const Record = require("../models/record");
const fs = require("fs");
const path = require("path");

router.get("/reset", async function (req, res) {
	console.log(`Dev - Reset`);

	const accRes = await Account.deleteMany({});
	console.log(`Dev - Reset - Removed ${accRes.deletedCount} Accounts`);

	const recRes = await Record.deleteMany({});
	console.log(`Dev - Reset - Removed ${recRes.deletedCount} Records`);

	const { exec } = require("child_process");
	var tmpPath = path.resolve(__dirname, "../tmp");
	var resetScript = path.resolve(__dirname, "reset.bash");
	const resetProcess = exec(`bash "${resetScript}" "${tmpPath}"`,
		function (err, stdout, stderr) {
			if (err) { console.error(err); return res.json(err); }
			if (stdout) {
				var splitted = stdout.split("\n");
				splitted.unshift(`Removed ${accRes.deletedCount} Accounts`);
				splitted.unshift(`Removed ${recRes.deletedCount} Records`);
				console.error(splitted);
				return res.json(splitted);
			}
		});
});

module.exports = router;
