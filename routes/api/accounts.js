const express = require("express");
const router = express.Router();

router.post("/new", function (req, res) {
	console.log("Account POST - /new - New Account");
	console.log(req.body);
	res.json({
		success: true,
		message: "ok"
	});
});

module.exports = router;
