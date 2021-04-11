var express = require("express");
const Person = require("../../lib/mongoose/person");
var router = express.Router();

router.get("/", async (req, res, next) => {
	const persons = await Person.find();
	return res.json(persons);
});

module.exports = router;
