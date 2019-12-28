function setLocalStorageInfo() {
	// set the info on the sidebar to the local storage to load it when page refreshes
	var infoForm = document.getElementById("sidebar-info-form");
	var formData = new FormData(infoForm);
	var sidebarInfo = JSON.stringify(Object.fromEntries(formData));
	localStorage.setItem("sidebarInfo", sidebarInfo);
}

function loadLocalStorageInfo() {
	// load the info on the sidebar when the page refreshes
	var sidebarInfo = JSON.parse(localStorage.getItem("sidebarInfo"));
	if (sidebarInfo !== null) {
		$("#username").val(sidebarInfo.username);
		$("#name").val(sidebarInfo.name);
		$("#age").val(sidebarInfo.age);
	}
}

$(function () {
	document.getElementById("username").addEventListener("input", setLocalStorageInfo);
	document.getElementById("name").addEventListener("input", setLocalStorageInfo);
	document.getElementById("age").addEventListener("input", setLocalStorageInfo);
	loadLocalStorageInfo();
});
