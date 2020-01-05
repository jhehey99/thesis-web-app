function getRecordId() {
	var pathname = window.location.pathname;
	var splitted = pathname.split("/");
	var recordId = splitted[splitted.length - 1]
	return recordId;
}

$(function () {
	var recordId = getRecordId();
	$.post(`/api/records/delete/${recordId}`)
		.done(function (data) {
			if (data.success) {
				alert(data.message);
			} else {
				console.log("Could not delete record");
				alert("Could not delete record");
			}
			window.location = "/records";
		}).fail(function () {
			console.log("There was an error in the server");
			alert("There was an error in the server");
		})
});
