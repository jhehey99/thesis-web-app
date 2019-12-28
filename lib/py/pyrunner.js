const fs = require("fs");
const path = require("path");

module.exports = function (pyConfig) {
	/* figures */
	this.figuresPath = undefined;
	this.recordId = undefined;
	this.baseDirectory = path.join(__dirname, "../../tmp/py_figs");
	this.rawDataPath = path.join(__dirname, "../../tmp/raw_data");

	/* python */
	this.pyConfig = pyConfig;
	this.pyScripts = path.resolve(__dirname, "./scripts")
	this.pyExec = path.resolve(__dirname, "./env/Scripts/python");

	this.initialize = function (recordId) {
		console.log(`PyRunner - Initialize ${pyConfig.name} - recordId: ${recordId}`);
		this.recordId = recordId;

		// create the figures path if it doesn't exists
		this.figuresPath = path.join(this.baseDirectory, this.recordId);
		if (!fs.existsSync(this.figuresPath)) {
			fs.mkdirSync(this.figuresPath, {
				recursive: true
			});
			console.log(`PyRunner - Py Figures Directory Created: ${this.figuresPath}`);
		} else {
			console.error(`PyRunner - Py Figures Directory Already Exists: ${this.figuresPath}`);
		}
	}

	this.execute = function () {
		console.log(`PyRunner - Execute ${pyConfig.name} - recordId: ${this.recordId}`);

		const { spawn } = require("child_process");
		var pyScript = pyConfig.pyScript;
		var pyPath = path.resolve(this.pyScripts, pyScript);
		var dataPath = path.resolve(this.rawDataPath, this.recordId);
		const pyProcess = spawn(this.pyExec, [pyPath, dataPath, JSON.stringify(pyConfig)]);

		pyProcess.stdout.on("data", function (data) {
			console.log(`PyRunner - ${pyConfig.name} - py process data...`);
			console.log(data.toString());
		});

		pyProcess.stderr.on("data", function (data) {
			console.log(`PyRunner - ${pyConfig.name} - py process error...`);
			console.log(data.toString());
		})

		pyProcess.stdout.on("close", function () {
			console.log(`PyRunner - ${pyConfig.name} - py process closed...`);
		});
	}
}
