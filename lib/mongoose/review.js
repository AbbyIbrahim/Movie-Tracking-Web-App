const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema(
	{
		content: { type: String, required: true },
		rating: { type: Number, required: true },
		user: { type: Schema.Types.ObjectId, ref: "user", required: true },
		movie: { type: Schema.Types.ObjectId, ref: "movie", required: true },
	},
	{
		timestamps: true,
	}
);

const Review = mongoose.model("review", reviewSchema);
module.exports = Review;
