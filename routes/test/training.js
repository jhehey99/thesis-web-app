const express = require("express");
const router = express.Router();

router.get("/", function (req, res) {
	res.html("training/training");
});

router.post("/train", function (req, res) {
	console.log(`Training POST - Train`);
	console.log(req.body);
	res.json("ok");
});

module.exports = router
