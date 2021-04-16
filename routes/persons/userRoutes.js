var express = require("express");
const isUser = require("../middlewares/isUser");
var router = express.Router();

router.use(isUser);

router.get("/:id/follow-toggle", async (req, res, next) => {
	const id = req.params.id;
	const user = req.user;

	user.toggleFollowPerson(id);

	try {
		await user.save();
		res.redirect("/persons/" + id);
	} catch (error) {
		next(error);
	}
});

module.exports = router;
