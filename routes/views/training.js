const express = require("express");
const router = express.Router();

router.get("/", function (req, res) {
	res.html("training/training");
});

router.post("/train", function (req, res) {
	var recordIds = req.body.recordIds;
	console.log(`Training POST - Train`);
	console.log(recordIds);
	res.json("ok");
	// TODO: Record Ids ba o ung Property na
})

module.exports = router
