function Record(data) {
	this.recordId = ko.observable(data.recordId);
}

function RecordListViewModel() {
	var self = this;
	self.records = ko.observableArray([]);

	$.getJSON("/api/records/count")
		.done(function (count) {
			console.log(`Count: ${count}`);
			$("#records-pagination").pagination({
				dataSource: "/api/records",
				locator: "items",
				pageSize: 2,
				totalNumber: count,
				className: 'paginationjs-theme-blue paginationjs-big d-flex justify-content-center',
				ajax: {
					beforeSend: function () {
						console.log("loading records");
					}
				},
				callback: function (records, pagination) {
					console.log(`Paginated Records obtained - length: ${records.length}`);
					console.log(records);
					var mappedRecords = $.map(records, function (item) { return ko.mapping.fromJS(item); });
					console.log(mappedRecords);
					self.records(mappedRecords);
				}
			});
		}).fail(function () {
			console.error("Could not get total document count");
		});



	// $.getJSON("/api/records", function (allData) {
	// 	var autoMappedRecords = $.map(allData, function (item) { return ko.mapping.fromJS(item); });
	// 	console.log(autoMappedRecords);
	// 	self.records(autoMappedRecords);
	// });
}

// Activates knockout.js
ko.applyBindings(new RecordListViewModel());
