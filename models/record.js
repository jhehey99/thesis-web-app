const mongoose = require("mongoose");
var types = mongoose.Schema.Types;

var schema = mongoose.Schema({
	accountId: { type: types.ObjectId, ref: "accounts" },
	recordId: types.String,
	recordType: types.String,
	title: types.String,
	figureNames: types.Mixed,
	dateRecorded: types.Date
});

schema.set('toObject', { virtuals: true });

module.exports = mongoose.model("records", schema);
