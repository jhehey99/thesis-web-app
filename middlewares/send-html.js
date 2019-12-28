const path = require("path");

module.exports = function (req, res, next) {
	res.html = function (file) {
		res.sendFile(path.join(__dirname, `../public/html/${file}.html`));
	};
	return next();
};
