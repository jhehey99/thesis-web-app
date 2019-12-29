function Record(data) {
	this.recordId = ko.observable(data.recordId);
}

function RecordListViewModel() {
	var self = this;
	self.records = ko.observableArray([]);

	$.getJSON("/api/records/etc/count")
		.done(function (count) {
			console.log(`Count: ${count}`);
			$("#records-pagination").pagination({
				dataSource: "/api/records",
				locator: "items",
				pageSize: 5,
				totalNumber: count,
				className: 'paginationjs-theme-blue paginationjs-big d-flex justify-content-center',
				ajax: {
					beforeSend: function () {
						console.log("loading records");
					}
				},
				callback: function (records, pagination) {
					console.log(`Paginated Records obtained - length: ${records.length}`);
					var mappedRecords = $.map(records, function (item) {
						item.recordUrl = `/records/${item.recordId}`;
						return ko.mapping.fromJS(item);
					});
					console.log(mappedRecords);
					self.records(mappedRecords);
				}
			});
		}).fail(function () {
			console.error("Could not get total document count");
		});
}

// Activates knockout.js
ko.applyBindings(new RecordListViewModel());
