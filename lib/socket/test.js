var io = require("socket.io-client");

module.exports = function (iso) {

	var base_socket = io.connect("http://localhost:6969");

	// var ecg = io.connect("http://localhost:6969/socket/ecg");
	setInterval(() => {
		f1 = 0.5;
		var t1 = Date.now() / 1000;
		var v1 = Math.round(512 * Math.sin(2 * Math.PI * f1 * t1)) + 512;
		base_socket.emit("raw-ecg", `1,${v1}`);
		// ecg.emit("raw-ecg", `1,${v1}`);
	}, 20);


	// var ppgarm_ir = io.connect("http://localhost:6969/socket/ppgarm-ir");
	setInterval(() => {
		f2 = 2;
		var t2 = Date.now() / 1000;
		var v2 = Math.round(512 * Math.sin(2 * Math.PI * f2 * t2)) + 512;
		base_socket.emit("raw-ppgarm-ir", `1,${v2}`);
		// ppgarm_ir.emit("raw-ppgarm-ir", `1,${v2}`);
	}, 20);

	// var ppgarm_red = io.connect("http://localhost:6969/socket/ppgarm-red");
	setInterval(() => {
		f3 = 2;
		var t3 = Date.now() / 1000;
		var v3 = Math.round(512 * Math.sin(2 * Math.PI * f3 * t3)) + 512;
		base_socket.emit("raw-ppgarm-red", `1,${v3}`);
		// ppgarm_red.emit("raw-ppgarm-red", `1,${v3}`);
	}, 20);

	// var ppgleg = io.connect("http://localhost:6969/socket/ppgleg");
	setInterval(() => {
		f4 = 0.5;
		var t4 = Date.now() / 1000;
		var v4 = Math.round(512 * Math.sin(2 * Math.PI * f4 * t4)) + 512;
		base_socket.emit("raw-ppgleg", `1,${v4}`);
		// ppgleg.emit("raw-ppgleg", `1,${v4}`);
	}, 20);


	// for testing device verification
	// setInterval(() => {
	// 	var device = io.connect("http://localhost:6969/");
	// 	device.emit("verify", "nodemcu");

	// 	device.on("verified", function (deviceId) {
	// 		console.log(`Test - Client Device Verified at ${deviceId}`);
	// 	})

	// 	setTimeout(() => {
	// 		device.disconnect();
	// 	}, 500);
	// }, 2000);



};
