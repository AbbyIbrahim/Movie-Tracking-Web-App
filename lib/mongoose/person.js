const mongoose = require("mongoose");
const { Schema } = mongoose;

const personSchema = new Schema(
	{
		name: { type: String, required: true, unique: true },
	},
	{
		timestamps: true,
	}
);

const Person = mongoose.model("person", personSchema);
module.exports = Person;
