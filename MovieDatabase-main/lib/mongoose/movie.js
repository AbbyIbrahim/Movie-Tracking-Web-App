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

const Movie = mongoose.model("movie", movieSchema);
module.exports = Movie;
