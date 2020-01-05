

function display(url, graph, displayEvent, displayCount = 400) {
	/* Constants needed for configuration */
	const displayInterval = 500;
	const clearDataEvent = "clear-data";

	/* Connect to IO Socket */
	var socket = io.connect(url);
	var times = [];
	var values = [];

	var updateGraph = function () {
		Plotly.restyle(graph, { x: [times], y: [values] });
		console.log(`Display - ${times.length}, ${values.length}`);
	}

	Plotly.plot(graph, [{
		y: [0],
		mode: "lines",
		line: {
			color: "#80CAF6"
		}
	}], {
		yaxis: { tickformat: ',d' }
	}
	);

	socket.on(displayEvent, function (data) {
		var time = new Date(data.time);
		times.push(time);
		values.push(data.value);
		while (times.length > displayCount) {
			times.shift();
		}
		while (values.length > displayCount) {
			values.shift();
		}
	});

	socket.on(clearDataEvent, function (data) {
		console.log(`Clear Data - ${url}`);
		times = [];
		values = [];
		updateGraph();
	});

	// update the display graph
	setInterval(updateGraph, displayInterval); // ms
}
