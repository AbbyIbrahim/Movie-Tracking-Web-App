const mongoose = require("mongoose");
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

movieSchema.statics.findByGenre = function (genre) {
	const regexp = new RegExp(genre, "i");
	return this.where({ genre: { $in: regexp } });
};

movieSchema.statics.search = function (query, genre) {
	query = new RegExp(query, "i");
	genre = new RegExp(genre, "i");
	return this.where({ $or: [{ title: query }, { plot: query }] }).where({
		genre: { $in: genre },
	});
};

const Movie = mongoose.model("movie", movieSchema);
module.exports = Movie;
