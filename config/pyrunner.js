module.exports = {
	bparm: {
		title: "Blood Pressure Arm",
		pyScript: "bp.py",
		rawDataPath: "",
		dataFiles: ["ecg.txt", "ppgarm-ir.txt"],
		pyResultsPath: "",
		figureNames: ["ecg", "systolic", "diastolic", "final"],
		figureType: "svg"
	},
	bpleg: {
		title: "Blood Pressure Leg",
		pyScript: "bp.py",
		rawDataPath: "",
		dataFiles: ["ecg.txt", "ppgleg.txt"],
		pyResultsPath: "",
		figureNames: ["ecg", "systolic", "diastolic", "final"],
		figureType: "svg"
	},
	bos: {
		title: "Blood Oxygen Saturation",
		pyScript: "bos.py",
		rawDataPath: "",
		dataFiles: ["ppgarm-ir.txt", "ppgarm-red.txt"],
		pyResultsPath: "",
		figureNames: ["bos-ir", "bos-red"],
		figureType: "svg"
	}
};
