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
};
