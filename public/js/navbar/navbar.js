$(function () {
	$("#navbar-nav").children().click(function (e) {
		window.localStorage.setItem("activeTab", $(e.target).attr("id"));
	});
	var activeTab = window.localStorage.getItem("activeTab");
	if (activeTab) {
		$(`#${activeTab}`).addClass("active");
		window.localStorage.removeItem("activeTab");
	}
	var navs = document.getElementById("navbar-nav").children;
	for (var i = 0; i < navs.length; i++) {
		nav = navs[i];
		nav.addEventListener("click", function () {
			var elems = document.getElementsByClassName("active");
			if (elems.length > 0) {
				current = elems[0];
				current.className = current.className.replace(" active", "");
			}
			this.className += " active";
		});
	}
});
