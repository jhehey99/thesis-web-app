function showElement(id, visible) {
 	var element = $(document.getElementById(id));
 	if (visible) {
 		element.show();
 	} else {
 		element.hide();
 	}
};
