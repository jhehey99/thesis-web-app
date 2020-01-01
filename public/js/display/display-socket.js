function display(url, graph, displayEvent, displayCount = 100, displayInterval = 500) {
	var socket = io.connect(url);

	Plotly.plot(graph, [{
		y: [0],
		mode: "lines",
		line: {
			color: "#80CAF6"
		}
	}]);

	var times = [];
	var values = [];

	socket.on(displayEvent, function (data) {
		var time = new Date(data.time);
		// var time = data.time;

		times.push(time);
		values.push(data.value);

		while (times.length > displayCount) {
			times.shift();
		}

		while (values.length > displayCount) {
			values.shift();
		}
	});

	// update the display graph
	setInterval(function () {
		var data = {
			x: [times],
			y: [values]
		};
		Plotly.restyle(graph, data);
	}, displayInterval); // ms
}
