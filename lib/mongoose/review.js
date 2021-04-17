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

// send notis
reviewSchema.post("save", async function (doc) {
	const userId = doc.user._id;
	const movieId = doc.movie._id;

	const User = require("./user");

	const followers = await User.find().where({
		followingUsers: { "$in": userId },
	});

	const promises = followers.map((user) => {
		user.notifications.push({
			type: "review",
			movie: movieId,
			user: userId,
		});
		return user.save();
	});

	await Promise.all(promises);
});

const Review = mongoose.model("review", reviewSchema);
module.exports = Review;
