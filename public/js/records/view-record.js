function getRecordId() {
	var pathname = window.location.pathname;
	var splitted = pathname.split("/");
	var recordId = splitted[splitted.length - 1]
	return recordId;
}

function RecordViewModel() {
	var self = this;
	var recordId = getRecordId();
	console.log(recordId);

	self.figures = ko.observableArray([]);
	self.figureUrls = ko.observableArray([]);

	$.getJSON(`/api/records/${recordId}`)
		.done(function (record) {
			console.log("Get Record Data");
			console.log(record);
			record.figureNames = ["bos-ir", "bos-red"];

			var mappedUrls = $.map(record.figureNames, function (figureName) {
				return { figureUrl: ko.observable(`/records/${recordId}/figs?figureName=${figureName}`) };
			});
			self.figureUrls(mappedUrls);
		}).fail(function () {
			console.error("Could not get record data");
		});
}

// Activates knockout.js
ko.applyBindings(new RecordViewModel());
