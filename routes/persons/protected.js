var express = require("express");
const isUser = require("../users/isUser");
var router = express.Router();

router.use(isUser);

router.get("/:id/follow-toggle", async (req, res, next) => {
	const id = req.params.id;
	const user = req.user;

	const index = user.followingPersons.indexOf(id);
	// if exists, remove otherwise add it
	if (index > -1) {
		user.followingPersons.splice(index, 1);
	} else {
		user.followingPersons.push(id);
	}

	try {
		await user.save();
		res.redirect("/persons/" + id);
	} catch (error) {
		next(error);
	}
});

module.exports = router;
