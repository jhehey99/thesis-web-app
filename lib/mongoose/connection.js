const mongoose = require("mongoose");

module.exports = {
	connect: function (config) {
		mongoose.connect(config.uris, config.options);
		var con = mongoose.connection;
		con.on("error", console.error.bind(console, "Error connecting to the database"));
		con.once("open", function () {
			console.log("Connection - Successfully connected to the database");
		});
	}
};
