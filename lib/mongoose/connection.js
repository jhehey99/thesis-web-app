const mongoose = require("mongoose");
const config = require("../../config/mongoose");

var connection = {
	connect: function () {
		mongoose.connect(config.uris, config.options);
		var con = mongoose.connection;
		con.on("error", console.error.bind(console, "Error connecting to the database"));
		con.once("open", function () {
			console.log("Connection - Successfully connected to the database");
		});
	}
};

module.exports = connection;
