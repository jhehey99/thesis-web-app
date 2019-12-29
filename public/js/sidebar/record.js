function alertReload(data, status) {
	console.log(data, status);
	setTimeout(function () {
		window.location.reload();
	}, 1000);
}

function postRecord(recordType) {
	// get info from localStorage, JSON form
	var info = JSON.parse(localStorage.getItem("sidebarInfo"));

	// get record id and duration
	var recordForm = document.getElementById("sidebar-record-form");
	var formData = new FormData(recordForm);
	var record = JSON.parse(JSON.stringify(Object.fromEntries(formData)));
	record.recordType = recordType;

	$.ajax({
		url: "/api/records/new",
		type: "post",
		dataType: "json",
		contentType: "application/json; charset=utf-8",
		data: JSON.stringify({
			info,
			record
		})
	}).done(function (data, status) {
		alertReload(data.message, status);
	}).fail(function (jqxhr, status) {
		alertReload(jqxhr, status);
	});
}

function getNewRecordId() {
	console.log("Get new Record Id");
	$.ajax({
		url: "/api/records/newRecordId",
		type: "get",
		dataType: "json",
	}).done(function (data, status) {
		var recordId = data.recordId;
		$("#recordId").val(recordId);
		console.log(`New record id: ${recordId}`);
	}).fail(function (jqxhr, status) {
		console.log("Can't get new record id ", jqxhr, status);
		$("#recordId").val("Error");
	});
}

// tas dito din ung new record id
$(function () {
	getNewRecordId();
});
