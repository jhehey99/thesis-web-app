module.exports = {
	ecg: {
		name: "ECG",
		recordName: "ecg.txt",
		namespace: "/socket/ecg",
		rawDataEvent: "raw-ecg",
		displayEvent: "display-ecg",
		recordEvent: "record-ecg",
	},
	ppgarmir: {
		name: "PPG Arm IR",
		recordName: "ppgarm-ir.txt",
		namespace: "/socket/ppgarm-ir",
		rawDataEvent: "raw-ppgarm-ir",
		displayEvent: "display-ppgarm-ir",
		recordEvent: "record-ppgarm-ir",
	},
	ppgarmred: {
		name: "PPG Arm Red",
		recordName: "ppgarm-red.txt",
		namespace: "/socket/ppgarm-red",
		rawDataEvent: "raw-ppgarm-red",
		displayEvent: "display-ppgarm-red",
		recordEvent: "record-ppgarm-red",
	},
	ppgleg: {
		name: "PPG Leg",
		recordName: "ppgleg.txt",
		namespace: "/socket/ppgleg",
		rawDataEvent: "raw-ppgleg",
		displayEvent: "display-ppgleg",
		recordEvent: "record-ppgleg",
	}
};
