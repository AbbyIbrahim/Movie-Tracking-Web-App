const mongoose = require("mongoose");
const _ = require("lodash");
const { Schema } = mongoose;

const personSchema = new Schema(
	{
		name: { type: String, required: true, unique: true },
	},
	{
		timestamps: true,
	}
);

personSchema.methods.toPublicObject = async function () {
	const Movie = require("./movie");

	const directed = await Movie.find().where({
		directors: { "$in": this._id },
	});
	const wrote = await Movie.find().where({
		writers: { "$in": this._id },
	});
	const acted = await Movie.find().where({
		actors: { "$in": this._id },
	});

	const person = this.toObject();
	return { ...person, directed, wrote, acted };
};

personSchema.methods.findTopCollaborators = async function () {
	const Movie = require("./movie");

	const personId = this._id;

	const movies = await Movie.find({
		$or: [
			{ directors: { $in: personId } },
			{ writers: { $in: personId } },
			{ actors: { $in: personId } },
		],
	});

	const chart = [];
	for await (let movie of movies) {
		const persons = [...movie.directors, ...movie.writers, ...movie.actors];
		persons.forEach((p) => {
			// if it's same person, stop
			if (_.isEqual(p, personId)) return;

			const index = _.findIndex(chart, { id: p });

			if (index > -1) {
				chart[index].hits++;
			} else {
				chart.push({
					id: p,
					hits: 1,
				});
			}
		});
	}

	// sort and take top five
	const chartTop = _.take(_.orderBy(chart, "hits", "desc"), 5);
	const topCollaborators = [];

	for await (let t of chartTop) {
		const person = await Person.findById(t.id);
		topCollaborators.push(person);
	}

	return topCollaborators;
};

const Person = mongoose.model("person", personSchema);
module.exports = Person;
