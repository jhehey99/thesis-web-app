module.exports = function (io, config) {
	var verifiedDevices = [];

	io.on("connection", function (socket) {

		// Devices must verify through this socket
		socket.on(config.verifyEvent, function (data) {
			console.log(`DeviceSocket - verify - socketId: ${socket.id}`);
			console.log(verifiedDevices);
			var deviceId = socket.id;
			var verified = verifiedDevices.includes(deviceId);

			if (data == config.verificationSignal && !verified) {
				// Push to Verified Devices and send its Device ID indicating it was verified
				verifiedDevices.push(deviceId);
				io.to(`${deviceId}`).emit(config.verifiedEvent, deviceId);
				console.log(`DeviceSocket - verify - Device at ${deviceId} was verified`);
			}
		});

		socket.on("disconnect", function () {
			// If socket disconnects and is in verifiedDevices, its a device. remove it
			if (verifiedDevices.includes(socket.id)) {
				verifiedDevices = verifiedDevices.filter(id => id != socket.id);
				console.log(`DeviceSocket - disconnect - Device at ${socket.id} was disconnected`);
			}
		});
	});
}
