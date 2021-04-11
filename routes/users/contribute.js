var express = require("express");
const { body, validationResult } = require("express-validator");
const createHttpError = require("http-errors");
var multer = require("multer");
const { GENRE } = require("../../constants");
const Movie = require("../../lib/mongoose/movie");
const Person = require("../../lib/mongoose/person");

var router = express.Router();
var upload = multer({ dest: "uploads/" });

router.get("/add-person", async (req, res) => {
	res.render("users/addPerson", { title: "Add Person" });
});

router.post("/add-person", body("name").notEmpty(), async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.render("errors", {
			title: "Error",
			msg: "validation failed",
			errors: errors.array(),
		});
	}
	const { name } = req.body;
	const person = new Person({
		name,
	});
	try {
		await person.save();
		res.redirect("/users/dashboard");
	} catch (e) {
		next(e);
	}
});

router.get("/add-movie", async (req, res) => {
	const persons = await Person.find();
	res.render("users/addMovie", { title: "Add Movie", persons, genre: GENRE });
});

router.post(
	"/add-movie",
	upload.single("poster"),
	body("title").notEmpty(),
	body("year").isNumeric(),
	body("released").notEmpty(),
	body("runtime").notEmpty(),
	body("genre").notEmpty(),
	body("directors").notEmpty(),
	body("writers").notEmpty(),
	body("actors").notEmpty(),
	body("plot").notEmpty(),
	async (req, res, next) => {
		if (!req.file) {
			return next(createHttpError("poster can not be empty"));
		}
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.render("errors", {
				title: "Error",
				msg: "validation failed",
				errors: errors.array(),
			});
		}
		const poster = req.file;
		const movie = new Movie({ ...req.body, poster: poster.filename });
		try {
			await movie.save();
			res.redirect("/users/dashboard");
		} catch (e) {
			next(e);
		}
	}
);

module.exports = router;
