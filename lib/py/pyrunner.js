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
	this.pyExec = path.resolve(__dirname, "./thesis-env/Scripts/python");

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
		console.log(`PyRunner - pyExec: ${this.pyExec}, pyScripts: ${this.pyScripts}`);

		const { spawn } = require("child_process");

		var pyScriptPath = path.resolve(this.pyScripts, pyConfig.pyScript);
		var dataPath = path.resolve(this.rawDataPath, this.recordId);

		// set the dataPath of the py config object and convert to json string
		pyConfig.dataPath = dataPath;
		pyConfig.figuresPath = this.figuresPath;
		var pyConfigJson = JSON.stringify(pyConfig);

		console.log(`PyRunner - pyScriptPath: ${pyScriptPath}, pyConfigJson: ${pyConfigJson}`);

		// spawn the process with the script and the config as arguments
		const pyProcess = spawn(this.pyExec, [pyScriptPath, pyConfigJson]);

		pyProcess.stdout.on("data", function (data) {
			console.log(`PyRunner - ${pyConfig.name} - py process data...`);
			console.log(data.toString());
		});

		pyProcess.stderr.on("data", function (data) {
			console.log(`PyRunner - ${pyConfig.name} - py process error...`);
			console.log(data.toString());
		});

		pyProcess.stdout.on("close", function () {
			console.log(`PyRunner - ${pyConfig.name} - py process closed...`);
		});
	}
}
