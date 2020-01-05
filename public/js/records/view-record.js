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

	self.figureUrls = ko.observableArray([]);
	self.title = ko.observable();

	$.getJSON(`/api/records/${recordId}`)
		.done(function (record) {
			// record.figureNames = ["bos-ir", "bos-red"];
			console.log("Get Record Data");
			console.log(record);

			var mappedUrls = $.map(record.figureNames, function (figureName) {
				return { figureUrl: ko.observable(`/records/${recordId}/results?figureName=${figureName}`) };
			});
			self.figureUrls(mappedUrls);
			self.title(record.title);
		}).fail(function () {
			console.error("Could not get record data");
		});
}

// Activates knockout.js
ko.applyBindings(new RecordViewModel());
