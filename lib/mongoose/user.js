const mongoose = require("mongoose");
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
	},
	{
		timestamps: true,
	}
);

const User = mongoose.model("user", userSchema);
module.exports = User;
