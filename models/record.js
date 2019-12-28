const mongoose = require("mongoose");
var types = mongoose.Schema.Types;

var schema = mongoose.Schema({
	accountId: types.ObjectId,
	recordId: types.String,
	dateRecorded: types.Date
});

module.exports = mongoose.model("records", schema);
