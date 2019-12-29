const express = require("express");
const router = express.Router();

router.get("/", function (req, res) {
	res.html("records");
});

module.exports = router;
