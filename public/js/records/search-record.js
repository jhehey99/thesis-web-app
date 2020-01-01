function title(str) {
	return str.replace(/(^|\s)\S/g, function (t) { return t.toUpperCase() });
}

function onSearchClicked(e) {
	e.preventDefault();
	var query = $(document.getElementById("query")).val();
	var param = $('#param input:radio:checked').val();
	if (!query) return;
	localStorage.setItem("searchQuery", query);
	localStorage.setItem("searchParam", param);
	localStorage.setItem("searchResultText", query);
	localStorage.setItem("searchResultParam", title(param));
	location.reload();
}

function onViewAllClicked(e) {
	e.preventDefault();
	localStorage.removeItem("searchQuery");
	location.reload();
}

function setResultsText() {
	var searchResultText = localStorage.getItem("searchResultText");
	var searchResultParam = localStorage.getItem("searchResultParam");
	$("#results").text(!searchResultText ? "All" : `${searchResultParam}: ${searchResultText}`);
	localStorage.removeItem("searchResultText");
	localStorage.removeItem("searchResultParam");
}

$(function () {
	var searchButton = document.getElementById("search");
	searchButton.addEventListener("click", onSearchClicked);

	var viewAllButton = document.getElementById("viewAll");
	viewAllButton.addEventListener("click", onViewAllClicked);

	setResultsText();
});
