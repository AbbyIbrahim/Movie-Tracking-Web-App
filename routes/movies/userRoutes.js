var express = require("express");
const { body, validationResult } = require("express-validator");
const Review = require("../../lib/mongoose/review");
const isUser = require("../middlewares/isUser");
const { createReview } = require("../middlewares/validations");
var router = express.Router();

router.use(isUser);

router.get("/:id/watchlist-toggle", async (req, res, next) => {
	const id = req.params.id;
	const user = req.user;

	user.toggleWatchlist(id);

	try {
		await user.save();
		res.redirect("/movies/" + id);
	} catch (error) {
		next(error);
	}
});

router.post("/:id/review", createReview, async (req, res, next) => {
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
});

module.exports = router;
