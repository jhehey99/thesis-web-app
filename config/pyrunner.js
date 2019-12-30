module.exports = {
	bparm: {
		title: "Blood Pressure Arm",
		pyScript: "test.py",
		dataPath: "",
		dataFiles: ["ecg.txt", "ppgarm-ir.txt"],
		figuresPath: "",
		figureNames: ["bparm"],
		figureType: "svg"
	},
	bpleg: {
		title: "Blood Pressure Leg",
		pyScript: "test.py",
		dataPath: "",
		dataFiles: ["ecg.txt", "ppgleg.txt"],
		figuresPath: "",
		figureNames: ["bpleg"],
		figureType: "svg"
	},
	bos: {
		title: "Blood Oxygen Saturation",
		pyScript: "bos.py",
		dataPath: "",
		dataFiles: ["ppgarm-ir.txt", "ppgarm-red.txt"],
		figuresPath: "",
		figureNames: ["bos-ir", "bos-red"],
		figureType: "svg"
	}

	// ecg: {
	// 	name: "ecg",
	// 	pyScript: "ecgprocessing.py",
	// 	savePath: "../tmp/py/",
	// 	figureCount: 1,
	// 	figureNames: ["ecg"],
	// 	figureType: "svg"
	// },
	// ppgarmir: {
	// 	name: "ppgarmir",
	// 	savePath: "../tmp/py/",
	// 	figureCount: 1,
	// 	figureNames: ["ppgarmir"],
	// 	figureType: "svg"
	// },
	// ppgarmred: {
	// 	name: "ppgarmred",
	// 	savePath: "../tmp/py/",
	// 	figureCount: 1,
	// 	figureNames: ["ppgarmred"],
	// 	figureType: "svg"
	// },
	// ppgleg: {
	// 	name: "ppgleg",
	// 	savePath: "../tmp/py/",
	// 	figureCount: 1,
	// 	figureNames: ["ppgleg"],
	// 	figureType: "svg"
	// }
};

/**
 *
 * where to save svg
	svg count
	svg file names
	svg file type

	# input data
	record id path
	record names
	record types

	# output data to file
	path

	# save to file from python
	# then read from server given path
	systolic diastolic peaks
	type
	etc.
 */
