var express = require("express");
const { validationResult } = require("express-validator");
const createHttpError = require("http-errors");
const { PER_PAGE } = require("../../../constants");
const Person = require("../../../lib/mongoose/person");
const { getPageSkip } = require("../../../lib/utils");
const isUser = require("../../middlewares/isUser");
const { createPerson } = require("../../middlewares/validations");

var router = express.Router();

// get persons
router.get("/", async (req, res, next) => {
	const name = req.query.name;
	try {
		let persons = Person.find();

		if (name) {
			persons = persons.where("name", new RegExp(name, "i"));
		}

		persons.limit(PER_PAGE).skip(getPageSkip(req.query.page));

		const pPersons = (await persons).map((person) => {
			return person.toObject();
		});

		res.json(pPersons);
	} catch (e) {
		next(e);
	}
});

// create person
router.post("/", isUser, createPerson, async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(APIError.withErrors("validation failed", errors.array()));
	}
	const person = new Person({
		name: req.body.name,
	});
	try {
		await person.save();
		const pPerson = person.toObject();
		res.json(pPerson);
	} catch (e) {
		next(e);
	}
});

// (protected)
router.get("/:id/follow-toggle", isUser, async (req, res, next) => {
	const id = req.params.id;
	const user = req.user;

	user.toggleFollowPerson(id);

	try {
		await user.save();
		res.json(user.followingPersons);
	} catch (e) {
		next(e);
	}
});

router.get("/:id", async (req, res, next) => {
	const id = req.params.id;
	try {
		const person = await Person.findById(id);

		if (!person) throw createHttpError(404);

		const topCollaborators = await person.findTopCollaborators();

		const pPerson = await person.toPublicObject();

		return res.json({ ...pPerson, topCollaborators });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
