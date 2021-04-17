const mongoose = require("mongoose");
const Movie = require("./movie");
const Review = require("./review");
const { Schema } = mongoose;

const userSchema = new Schema(
	{
		name: { type: String, required: true },
		username: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		isContributor: { type: Boolean },
		watchlist: [{ type: Schema.Types.ObjectId, ref: "movie" }],
		followingUsers: [{ type: Schema.Types.ObjectId, ref: "user" }],
		followingPersons: [{ type: Schema.Types.ObjectId, ref: "person" }],
		notifications: [Schema.Types.Mixed],
	},
	{
		timestamps: true,
	}
);

userSchema.methods.toPublicObject = async function () {
	const reviews = await Review.find({
		user: this._id,
	});

	const pUser = this.toSafeObject();

	return { ...pUser, reviews };
};

userSchema.methods.movieSuggestions = async function (limit = 4) {
	const length = this.watchlist.length;
	if (length) {
		await this.populate("watchlist").execPopulate();
		const lastMovie = this.watchlist[length - 1];
		const firstGenre = lastMovie.genre[0];
		return Movie.findByGenre(firstGenre).limit(limit);
	}
	return [];
};

userSchema.methods.toSafeObject = function () {
	const obj = this.toObject();
	delete obj.password;
	return obj;
};

userSchema.methods.toggleFollowPerson = function (id) {
	const index = this.followingPersons.indexOf(id);
	// if exists, remove otherwise add it
	if (index > -1) {
		this.followingPersons.splice(index, 1);
	} else {
		this.followingPersons.push(id);
	}
	return this;
};

userSchema.methods.toggleFollowUser = function (id) {
	const index = this.followingUsers.indexOf(id);
	// if exists, remove otherwise add it
	if (index > -1) {
		this.followingUsers.splice(index, 1);
	} else {
		this.followingUsers.push(id);
	}
	return this;
};

userSchema.methods.toggleWatchlist = function (id) {
	const index = this.watchlist.indexOf(id);
	// if exists, remove otherwise add it
	if (index > -1) {
		this.watchlist.splice(index, 1);
	} else {
		this.watchlist.push(id);
	}
	return this;
};

const User = mongoose.model("user", userSchema);
module.exports = User;
