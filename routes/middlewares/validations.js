const { body } = require("express-validator");

module.exports = {
	createMovie: [
		body("title").notEmpty(),
		body("year").isNumeric(),
		body("released").notEmpty(),
		body("runtime").notEmpty(),
		body("genre").notEmpty(),
		body("directors").notEmpty(),
		body("writers").notEmpty(),
		body("actors").notEmpty(),
		body("plot").notEmpty(),
	],
	createUser: [
		body("name").notEmpty(),
		body("username").notEmpty(),
		body("password").notEmpty(),
	],
	signInUser: [body("username").notEmpty(), body("password").notEmpty()],
};
