const mongoose = require("mongoose");
var types = mongoose.Schema.Types;

var schema = mongoose.Schema({
	username: types.String,
	name: types.String,
	age: types.Number
});

module.exports = mongoose.model("accounts", schema);
