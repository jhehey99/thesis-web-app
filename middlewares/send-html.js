const path = require("path");

module.exports = function (req, res, next) {
	res.html = function (file) {
		var htmlPath = path.join(__dirname, `../public/html/${file}.html`);
		console.log(`Send Html file: ${htmlPath}`);
		res.sendFile(htmlPath);
	};
	return next();
};
