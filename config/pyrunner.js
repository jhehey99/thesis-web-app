module.exports = {
	bparm: {
		name: "Blood Pressure Arm",
		pyScript: "test.py",
		dataFiles: ["ecg.txt", "ppgarm-ir.txt"],
		figureNames: ["bparm"],
		figureType: "svg"
	},
	bpleg: {
		name: "Blood Pressure Leg",
		pyScript: "test.py",
		dataFiles: ["ecg.txt", "ppgleg.txt"],
		figureNames: ["bpleg"],
		figureType: "svg"
	},
	bos: {
		name: "Blood Oxygen Saturation",
		pyScript: "bos.py",
		dataFiles: ["ppgarm-ir.txt", "ppgarm-red.txt"],
		figureNames: ["bos"],
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
