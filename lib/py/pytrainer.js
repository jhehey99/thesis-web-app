const fs = require("fs");
const path = require("path");


module.exports = function () {

	/* Python Scripts and Interpreter */
	this.pyScripts = path.resolve(__dirname, "./scripts")
	this.pyExec = path.resolve(__dirname, "./thesis-env/Scripts/python");
	this.pyTrainingDir = path.join(__dirname, "../../tmp/py_training");

	this.train = function (recordType, config) {
		var pyScript = "training.py";
		config.saveDir = path.join(this.pyTrainingDir, config.trainingId);
		if (!fs.existsSync(config.saveDir)) {
			fs.mkdirSync(config.saveDir, {
				recursive: true
			});
			console.log(`PyRunner - Py Training Saving Directory Created: ${config.saveDir}`);
		} else {
			console.error(`PyRunner - Py Training Saving Directory Already Exists: ${config.saveDir}`);
		}

		// spawn the child process for executing the python script
		var pyScriptPath = path.resolve(this.pyScripts, pyScript);
		const { spawn } = require("child_process");
		const pyProcess = spawn(this.pyExec, [pyScriptPath, recordType, JSON.stringify(config)]);//, pyConfigJson])

		pyProcess.stdout.on("data", function (data) {
			console.log(`PyTrainer - ${config.title} - py trainer data...`);
			console.log(data.toString());
			// Dito mag lagay ng training ID and save the model properties to db
		});

		pyProcess.stderr.on("data", function (data) {
			console.log(`PyTrainer - ${config.title} - py trainer error...`);
			console.log(data.toString());
		});

		pyProcess.stdout.on("close", function () {
			console.log(`PyTrainer - ${config.title} - py trainer closed...`);
		});
	}
}
