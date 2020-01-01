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
const connection = require("./lib/mongoose/connection");
connection.connect();

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

/**
 * Place socket declarations here
 */
/* Data Sockets */
const dataSocketConfig = require("./config/datasocket");
var DataSocket = require("./lib/socket/datasocket");

/* Device Socket */
const deviceSocketConfig = require("./config/devicesocket");
var DeviceSocket = require("./lib/socket/devicesocket");

/* Process Sockets */
const processSocketConfig = require("./config/processsocket");
var ProcessSocket = require("./lib/socket/processsocket");

/* Python Config */
const pyConfig = require("./config/pyrunner");
var PyRunner = require("./lib/py/pyrunner");

app.setSocket = function (io) {
	/* Client Sockets for testing */
	// require("./lib/socket/test")(io);

	io.on("connection", function (socket) {
		console.log(`SocketIO - Connected socketId: ${socket.id}`);
	});

	/* Data Sockets */
	var ecgSocket = new DataSocket(io, dataSocketConfig.ecg);
	var ppgarmirSocket = new DataSocket(io, dataSocketConfig.ppgarmir);
	var ppgarmredSocket = new DataSocket(io, dataSocketConfig.ppgarmred);
	var ppglegSocket = new DataSocket(io, dataSocketConfig.ppgleg);

	/* Device Socket */
	var deviceSocket = new DeviceSocket(io, deviceSocketConfig);

	/* Python Process Runners */
	var bparmPyRunner = new PyRunner(pyConfig.bparm);
	var bplegPyRunner = new PyRunner(pyConfig.bpleg);
	var bosPyRunner = new PyRunner(pyConfig.bos);

	/* Process Sockets */
	var bparmSocket = new ProcessSocket(io, processSocketConfig.bparm, bparmPyRunner);
	var bplegSocket = new ProcessSocket(io, processSocketConfig.bpleg, bplegPyRunner);
	var bosSocket = new ProcessSocket(io, processSocketConfig.bos, bosPyRunner);
};

module.exports = app;
