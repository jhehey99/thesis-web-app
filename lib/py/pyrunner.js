const fs = require("fs");
const path = require("path");
const Record = require("../../models/record");

module.exports = function (pyConfig) {
	this.pyResultsPath = undefined;
	this.recordId = undefined;
	this.duration = undefined;
	this.pyConfig = pyConfig;

	/* Directories */
	this.rawDataDir = path.join(__dirname, "../../tmp/raw_data");
	this.pyResultsDir = path.join(__dirname, "../../tmp/py_results");

	/* Python Scripts and Interpreter */
	this.pyScripts = path.resolve(__dirname, "./scripts")
	this.pyExec = path.resolve(__dirname, "./thesis-env/Scripts/python");

	this.initialize = function (config) {
		console.log(`PyRunner - Initialize ${pyConfig.title} - config: ${config}`);
		this.recordId = config.recordId;
		this.duration = config.duration;

		// create the results path if it doesn't exists
		this.pyResultsPath = path.join(this.pyResultsDir, this.recordId);
		if (!fs.existsSync(this.pyResultsPath)) {
			fs.mkdirSync(this.pyResultsPath, {
				recursive: true
			});
			console.log(`PyRunner - Py Results Directory Created: ${this.pyResultsPath}`);
		} else {
			console.error(`PyRunner - Py Results Directory Already Exists: ${this.pyResultsPath}`);
		}
	}

	this.updateRecord = function (recordId, properties) {
		Record.findOne({ recordId }).exec(function (err, record) {
			if (err) { console.error(err); return err; }
			record.properties = properties;
			record.save(function (err, rec) {
				if (err) { console.error(err); return err; }
				console.log(`Record Update Properties - ${rec.recordId}`);
			});
		});
	}

	this.execute = function () {
		console.log(`PyRunner - Execute ${pyConfig.title} - recordId: ${this.recordId}`);
		console.log(`PyRunner - pyExec: ${this.pyExec}, pyScripts: ${this.pyScripts}`);

		const { spawn } = require("child_process");

		var pyScriptPath = path.resolve(this.pyScripts, pyConfig.pyScript);
		var rawDataPath = path.resolve(this.rawDataDir, this.recordId);

		// set the rawDataPath of the py config object and convert to json string
		pyConfig.duration = this.duration;
		pyConfig.rawDataPath = rawDataPath;
		pyConfig.pyResultsPath = this.pyResultsPath;
		var pyConfigJson = JSON.stringify(pyConfig);

		console.log(`PyRunner - pyScriptPath: ${pyScriptPath}, pyConfigJson:`);
		console.log(pyConfig);

		// spawn the process with the script and the config as arguments
		const pyProcess = spawn(this.pyExec, [pyScriptPath, pyConfigJson]);

		pyProcess.stdout.on("data", function (data) {
			console.log(`PyRunner - ${pyConfig.title} - py process data...`);
			console.log(data.toString());
		});

		pyProcess.stderr.on("data", function (data) {
			console.log(`PyRunner - ${pyConfig.title} - py process error...`);
			console.log(data.toString());
			// TODO: Ung properties manggagaling dapat sa python script output
			var properties = [{ PTT: 69 }, { RPDPT: 96 }];
			this.updateRecord(this.recordId, properties);
		});

		pyProcess.stdout.on("close", function () {
			console.log(`PyRunner - ${pyConfig.title} - py process closed...`);
		});
	}
}
