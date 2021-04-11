var express = require("express");
const { body, validationResult } = require("express-validator");
const Review = require("../../lib/mongoose/review");
const isUser = require("../users/isUser");
var router = express.Router();

router.use(isUser);

router.get("/:id/watchlist-toggle", async (req, res, next) => {
	const id = req.params.id;
	const user = req.user;

	const index = user.watchlist.indexOf(id);
	// if exists, remove otherwise add it
	if (index > -1) {
		user.watchlist.splice(index, 1);
	} else {
		user.watchlist.push(id);
	}

	try {
		await user.save();
		res.redirect("/movies/" + id);
	} catch (error) {
		next(error);
	}
});

router.post(
	"/:id/review",
	body("rating").isNumeric(),
	body("content").notEmpty(),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.render("errors", {
				title: "Error",
				msg: "validation failed",
				errors: errors.array(),
			});
		}
		const { rating, content } = req.body;
		const movieId = req.params.id;

		try {
			const review = new Review({
				content,
				rating,
				movie: movieId,
				user: req.user._id,
			});
			await review.save();
			res.redirect("/movies/" + movieId);
		} catch (error) {
			next(error);
		}
	}
);

module.exports = router;
