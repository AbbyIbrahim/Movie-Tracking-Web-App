const mongoose = require("mongoose");
const _ = require("lodash");
const Person = require("./person");
const { PER_PAGE } = require("../../constants");
const { Schema } = mongoose;

const movieSchema = new Schema(
	{
		title: { type: String, required: true },
		year: { type: Number, required: true },
		released: { type: String, required: true },
		runtime: { type: String, required: true },
		genre: [String],
		directors: [{ type: Schema.Types.ObjectId, ref: "person" }],
		writers: [{ type: Schema.Types.ObjectId, ref: "person" }],
		actors: [{ type: Schema.Types.ObjectId, ref: "person" }],
		plot: { type: String, required: true },
		poster: { type: String, required: true },
	},
	{
		timestamps: true,
	}
);

movieSchema.post("save", async function (movie) {
	const persons = _.uniq([
		...movie.directors,
		...movie.writers,
		...movie.actors,
	]);

	const User = require("./user");

	for await (let person of persons) {
		const followers = await User.find({
			followingPersons: { $in: person },
		});
		for await (let user of followers) {
			user.notifications.push({
				type: "movie",
				movie: movie._id,
				person: person,
			});
			await user.save();
		}
	}
});

movieSchema.methods.findSimilar = function (limit = 3) {
	const randomGenre = _.sample(this.genre);
	return Movie.findByGenre(randomGenre)
		.where({ _id: { $ne: this._id } })
		.limit(limit);
};

movieSchema.statics.findByGenre = function (genre) {
	const regexp = new RegExp(genre, "i");
	return this.where({ genre: { $in: regexp } });
};

movieSchema.statics.search = async function (query, genre, skip) {
	query = new RegExp(query, "i");
	genre = new RegExp(genre, "i");

	const persons = (
		await Person.find({
			name: query,
		})
	).map((p) => p._id);

	return this.where({
		$or: [
			{ title: query },
			{ plot: query },
			{ genre: { $in: query } },
			{ directors: { $in: persons } },
			{ writers: { $in: persons } },
			{ actors: { $in: persons } },
		],
	})
		.where({
			genre: { $in: genre },
		})
		.limit(PER_PAGE)
		.skip(skip);
};

const Movie = mongoose.model("movie", movieSchema);
module.exports = Movie;
