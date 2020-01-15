function Record(data) {
	this.recordId = ko.observable(data.recordId);
}

function RecordListViewModel() {
	var self = this;
	self.records = ko.observableArray([]);

	var searchQuery = localStorage.getItem("searchQuery");
	var searchParam = localStorage.getItem("searchParam");

	console.log("Records List");
	console.log(searchQuery);
	console.log(searchParam);


	$.getJSON(`/api/records/etc/count?query=${searchQuery}&param=${searchParam}`)
		.done(function (count) {
			console.log(`Count: ${count}`);
			$("#records-pagination").pagination({
				dataSource: `/api/records?query=${searchQuery}&param=${searchParam}`,
				totalNumber: count,
				locator: "items",
				pageSize: 5,
				className: 'paginationjs-theme-blue paginationjs-big d-flex justify-content-center',
				ajax: {
					beforeSend: function () {
						console.log("loading records");
					}
				},
				callback: function (records, pagination) {
					console.log(`Paginated Records obtained - length: ${records.length}`);
					var mappedRecords = [];
					for (var i = 0; i < records.length; i++) {
						var item = records[i];
						item.recordUrl = `/records/${item.recordId}`;
						item.deleteUrl = `/records/delete/${item.recordId}`;
						item.index = i + 1 + ((pagination.pageNumber - 1) * pagination.pageSize);
						mappedRecords.push(ko.mapping.fromJS(item));
					}

					console.log(mappedRecords);
					self.records(mappedRecords);
					console.log(self.records);
					localStorage.removeItem("searchQuery");
					localStorage.removeItem("searchParam");
				}
			});
		}).fail(function () {
			console.error("Could not get total document count");
		});
}

// Activates knockout.js
ko.applyBindings(new RecordListViewModel());
