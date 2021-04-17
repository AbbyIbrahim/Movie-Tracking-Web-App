const mongoose = require("mongoose");
const Movie = require("./movie");
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

const Person = mongoose.model("person", personSchema);
module.exports = Person;
