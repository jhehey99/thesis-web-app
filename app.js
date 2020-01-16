const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({
	extended: false
}));
app.use(cookieParser());
app.use("/public", express.static(path.join(__dirname, "public")));

/**
 * Database connection
 */
const mongooseConfig = require("./config/mongoose");
const connection = require("./lib/mongoose/connection");
connection.connect(mongooseConfig);

/**
 * My middlewares
 */
app.use(require("./middlewares/send-html"));

/**
 * Routes
 */
app.use("/", require("./routes/views/index"));
app.use("/bp", require("./routes/views/bp"));
app.use("/bos", require("./routes/views/bos"));
app.use("/records", require("./routes/views/records"));
app.use("/api/accounts", require("./routes/api/accounts"));
app.use("/api/records", require("./routes/api/records"));
app.use("/training", require("./routes/test/training"));
app.use("/dev", require("./dev/dev"));

/**
 * Place socket declarations here
 */
/* Data Sockets */
const dataSocketConfig = require("./config/datasocket");
const DataSocket = require("./lib/socket/datasocket");

/* Ir and Red Transition Socket */
const ledTransitionSocketConfig = require("./config/ledtransitionsocket");
const LedTransitionSocket = require("./lib/socket/ledtransitionsocket");

/* Device Socket */
const deviceSocketConfig = require("./config/devicesocket");
const DeviceSocket = require("./lib/socket/devicesocket");

/* Process Sockets */
const processSocketConfig = require("./config/processsocket");
const ProcessSocket = require("./lib/socket/processsocket");

/* Python Config */
const pyConfig = require("./config/pyrunner");
const PyRunner = require("./lib/py/pyrunner");

app.setSocket = function (io) {
	/* Client Sockets for testing */
	// require("./lib/socket/test")(io);

	io.on("connection", function (socket) {
		console.log(`SocketIO - Connected socketId: ${socket.id}`);
	});

	/* Data Sockets */
	const ecgSocket = new DataSocket(io, dataSocketConfig.ecg);
	const ppgarmirSocket = new DataSocket(io, dataSocketConfig.ppgarmir);
	const ppgarmredSocket = new DataSocket(io, dataSocketConfig.ppgarmred);
	const ppglegSocket = new DataSocket(io, dataSocketConfig.ppgleg);

	/* Ir and Red Transition Socket */
	const transitionSocket = new LedTransitionSocket(io, ledTransitionSocketConfig, dataSocketConfig.ppgarmir, dataSocketConfig.ppgarmred);

	/* Device Socket */
	const deviceSocket = new DeviceSocket(io, deviceSocketConfig);

	/* Python Process Runners */
	const bparmPyRunner = new PyRunner(pyConfig.bparm);
	const bplegPyRunner = new PyRunner(pyConfig.bpleg);
	const bosPyRunner = new PyRunner(pyConfig.bos);

	/* Process Sockets */
	const bparmSocket = new ProcessSocket(io, processSocketConfig.bparm, bparmPyRunner);
	const bplegSocket = new ProcessSocket(io, processSocketConfig.bpleg, bplegPyRunner);
	const bosSocket = new ProcessSocket(io, processSocketConfig.bos, bosPyRunner);
};

module.exports = app;
