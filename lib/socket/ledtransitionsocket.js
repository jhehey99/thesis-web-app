module.exports = function (io, config, irConfig, redConfig) {
	const Led = { Null: 0, Ir: 1, Red: 2 };
	var activeLed = Led.Null;

	io.on("connection", function (socket) {
		/* IR is active */
		socket.on(irConfig.rawDataEvent, function () {
			if (activeLed != Led.Ir) {
				console.log(`Led Transition Socket - Red to Ir`);
				/* Clear graph display of inactive led */
				io.of(redConfig.namespace).emit("clear-data", { clear: true });

				/* Update Active Led and emit to socket */
				activeLed = Led.Ir;
				io.of(irConfig.namespace).emit("active-led", { activeLed });
			}
		});

		/* RED is active */
		socket.on(redConfig.rawDataEvent, function () {
			if (activeLed != Led.Red) {
				console.log(`Led Transition Socket - Ir to Red`);
				/* Clear graph display of inactive led */
				io.of(irConfig.namespace).emit("clear-data", { clear: true });

				/* Update Active Led and emit to socket */
				activeLed = Led.Red;
				io.of(redConfig.namespace).emit("active-led", { activeLed });
			}
		});
	});
}
