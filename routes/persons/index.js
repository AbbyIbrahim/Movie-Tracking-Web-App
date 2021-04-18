var express = require("express");
const createHttpError = require("http-errors");
const Person = require("../../lib/mongoose/person");
const Movie = require("../../lib/mongoose/movie");
var router = express.Router();

router.get("/:id", async (req, res, next) => {
	const id = req.params.id;
	try {
		const person = await Person.findById(id);

		if (!person) throw "not found";

		const topCollaborators = await person.findTopCollaborators();

		const directed = await Movie.find().where({
			directors: { "$in": person._id },
		});

		const wrote = await Movie.find().where({
			writers: { "$in": person._id },
		});

		const acted = await Movie.find().where({
			actors: { "$in": person._id },
		});

		return res.render("persons/single", {
			title: person.name,
			person,
			directed,
			wrote,
			acted,
			topCollaborators,
			isFollowing:
				req.user && req.user.followingPersons.includes(person._id),
		});
	} catch (e) {
		return next(createHttpError(404));
	}
});

router.use("/", require("./userRoutes"));
module.exports = router;
