function TrainingRecordListViewModel(recordType = "bos") {
	var self = this;
	self.typeBos = ko.observable(recordType == "bos");
	self.records = ko.observableArray([]);
	self.typeBp = ko.observable(recordType == "bparm" || recordType == "bpleg");

	$.getJSON(`/api/records/type/${recordType}`)
		.done(function (records) {
			var mappedRecords = [];
			for (var i = 0; i < records.length; i++) {
				var item = records[i];
				item.index = i + 1;
				item.spo2Id = `${recordType}-spo2-${item.index}`;
				item.sbpId = `${recordType}-sbp-${item.index}`;
				item.dbpId = `${recordType}-dbp-${item.index}`;
				item.selectId = `${recordType}-select-${item.index}`;
				item.username = item.accountId.username;
				item.name = item.accountId.name;
				// TODELETE
				item.property = 69;

				// TODO: Test tong properties and get from server ung data
				if (recordType == "bos") {
					item.ratio = 1;
				} else {
					item.ptt = 2;
					item.rpdpt = 3;
				}

				item.dateRecorded = new Date(item.dateRecorded).toLocaleString();
				mappedRecords.push(ko.mapping.fromJS(item));
			}
			self.records(mappedRecords);
			window.localStorage.setItem("recordsLength", records.length);
			window.localStorage.setItem("recordType", recordType);
			console.log(self.records);
			console.log(mappedRecords);

			// get the localstorage values
			if (recordType == "bos") {
				var spo2s = JSON.parse(window.localStorage.getItem("spo2s"));
				for (var i = 0; i < spo2s.length; i++) {
					$(`#bos-spo2-${i + 1}`).val(spo2s[i]);
				}
				var bosSelect = JSON.parse(window.localStorage.getItem("bosSelect"));
				for (var i = 0; i < bosSelect.length; i++) {
					$(`#bos-select-${i + 1}`).prop("checked", bosSelect[i]);
				}
			} else if (recordType == "bparm") {
				var armsbps = JSON.parse(window.localStorage.getItem("armsbps"));
				for (var i = 0; i < armsbps.length; i++) {
					$(`#bparm-sbp-${i + 1}`).val(armsbps[i]);
				}
				var armdbps = JSON.parse(window.localStorage.getItem("armdbps"));
				for (var i = 0; i < armdbps.length; i++) {
					$(`#bparm-dbp-${i + 1}`).val(armdbps[i]);
				}
				var armSelect = JSON.parse(window.localStorage.getItem("armSelect"));
				for (var i = 0; i < armSelect.length; i++) {
					$(`#bparm-select-${i + 1}`).prop("checked", armSelect[i]);
				}
			} else if (recordType == "bpleg") {
				var legsbps = JSON.parse(window.localStorage.getItem("legsbps"));
				for (var i = 0; i < legsbps.length; i++) {
					$(`#bpleg-sbp-${i + 1}`).val(legsbps[i]);
				}
				var legdbps = JSON.parse(window.localStorage.getItem("legdbps"));
				for (var i = 0; i < legdbps.length; i++) {
					$(`#bpleg-dbp-${i + 1}`).val(legdbps[i]);
				}
				var legSelect = JSON.parse(window.localStorage.getItem("legSelect"));
				for (var i = 0; i < legSelect.length; i++) {
					$(`#bpleg-select-${i + 1}`).prop("checked", legSelect[i]);
				}
			}
		}).fail(function () {
			console.error("Could not get records");
		});
}

// When page refresh, we store the inputs in localstorage para di mawala
$(function () {
	window.onbeforeunload = function () {
		var recordsLength = window.localStorage.getItem("recordsLength");
		var recordType = window.localStorage.getItem("prevRecordType");

		console.log(`before unload ${recordsLength} ${recordType}`);

		var spo2s = [], armsbps = [], armdbps = [], legsbps = [], legdbps = [];
		var bosSelect = [], armSelect = [], legSelect = [];

		// get the vals
		for (var i = 1; i <= recordsLength; i++) {
			if (recordType == "bos") {
				spo2s.push($(`#bos-spo2-${i}`).val());
				bosSelect.push($(`#bos-select-${i}`).is(":checked"));
			} else if (recordType == "bparm") {
				armsbps.push($(`#bparm-sbp-${i}`).val());
				armdbps.push($(`#bparm-dbp-${i}`).val());
				armSelect.push($(`#bparm-select-${i}`).is(":checked"));
			} else if (recordType == "bpleg") {
				legsbps.push($(`#bpleg-sbp-${i}`).val());
				legdbps.push($(`#bpleg-dbp-${i}`).val());
				legSelect.push($(`#bpleg-select-${i}`).is(":checked"));
			}
		}

		// stores the vals
		if (recordType == "bos") {
			console.log(bosSelect);
			window.localStorage.setItem("spo2s", JSON.stringify(spo2s));
			window.localStorage.setItem("bosSelect", JSON.stringify(bosSelect));
		} else if (recordType == "bparm") {
			console.log(armSelect);
			window.localStorage.setItem("armsbps", JSON.stringify(armsbps));
			window.localStorage.setItem("armdbps", JSON.stringify(armdbps));
			window.localStorage.setItem("armSelect", JSON.stringify(armSelect));
		} else if (recordType == "bpleg") {
			console.log(legSelect);
			window.localStorage.setItem("legsbps", JSON.stringify(legsbps));
			window.localStorage.setItem("legdbps", JSON.stringify(legdbps));
			window.localStorage.setItem("legSelect", JSON.stringify(legSelect));
		}

		window.localStorage.setItem("prevRecordType", window.localStorage.getItem("recordType"));
	}
});

$(function () {
	// set new record type
	var radio = $("input:radio[name=recordType]");
	radio.on("change", function () {
		console.log($(this).val());
		var recordType = $(this).val();
		window.localStorage.setItem("recordType", recordType);
		location.reload();
	});
});

$(function () {
	var recordType = window.localStorage.getItem("recordType");
	if (!recordType) recordType = "bos";

	var radio = $(`#${recordType}-radio`);
	radio.attr("checked", "");

	ko.applyBindings(TrainingRecordListViewModel(recordType));
});

$(function () {
	var train = $("#start-training");
	train.on("click", function (e) {
		e.preventDefault();
		console.log("Start Training");

		var recordType = window.localStorage.getItem("recordType");
		// console.log($('.train-check:checkbox:checked'));

		var recordIds = [];
		$('.train-check:checkbox:checked').each(function () {
			if (this.checked) {
				recordIds.push($(this).val());
			}
		});

		console.log(recordIds);

		$.ajax({
			url: "/training/train",
			type: "post",
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify({ recordIds })
		}).done(function (data, status) {
			console.log(data.message, status);
		}).fail(function (jqxhr, status) {
			console.log(jqxhr, status);
		});

	});
});


// Clear Values
$(function () {
	$("#clear-values").click(function (e) {
		e.preventDefault();
		var recordType = window.localStorage.getItem("recordType");
		var recordsLength = window.localStorage.getItem("recordsLength");
		console.log(`Clear Values - ${recordType} - ${recordsLength}`);

		if (recordType == "bos") {
			window.localStorage.removeItem("spo2s");
			for (var i = 0; i < recordsLength; i++) {
				$(`#bos-spo2-${i + 1}`).val("");
			}
		} else if (recordType == "bparm") {
			window.localStorage.removeItem("armsbps");
			for (var i = 0; i < recordsLength; i++) {
				$(`#bparm-sbp-${i + 1}`).val("");
			}
			window.localStorage.removeItem("armdbps");
			for (var i = 0; i < recordsLength; i++) {
				$(`#bparm-dbp-${i + 1}`).val("");
			}
		} else if (recordType == "bpleg") {
			window.localStorage.removeItem("legsbps");
			for (var i = 0; i < recordsLength; i++) {
				$(`#bpleg-sbp-${i + 1}`).val("");
			}
			window.localStorage.removeItem("legdbps");
			for (var i = 0; i < recordsLength; i++) {
				$(`#bpleg-dbp-${i + 1}`).val("");
			}
		}
	});
});

// Select All
$(function () {
	$("#select-all").click(function (e) {
		e.preventDefault();
		var recordType = window.localStorage.getItem("recordType");
		var recordsLength = window.localStorage.getItem("recordsLength");
		console.log(`Select All - ${recordType} - ${recordsLength}`);
		for (var i = 0; i < recordsLength; i++) {
			$(`#${recordType}-select-${i + 1}`).prop("checked", true);
		}
	});
});

// Deselect All
$(function () {
	$("#deselect-all").click(function (e) {
		e.preventDefault();
		var recordType = window.localStorage.getItem("recordType");
		var recordsLength = window.localStorage.getItem("recordsLength");
		console.log(`Deselect All - ${recordType} - ${recordsLength}`);
		for (var i = 0; i < recordsLength; i++) {
			$(`#${recordType}-select-${i + 1}`).prop("checked", false);
		}
	});
});
