var express = require("express");
const { validationResult } = require("express-validator");
const createHttpError = require("http-errors");
const multer = require("multer");
const { PER_PAGE } = require("../../../constants");
const Movie = require("../../../lib/mongoose/movie");
const Review = require("../../../lib/mongoose/review");
const APIError = require("../../../lib/apiError");
const { getPageSkip } = require("../../../lib/utils");
const isUser = require("../../middlewares/isUser");
const { createMovie, createReview } = require("../../middlewares/validations");

var router = express.Router();
var upload = multer({ dest: "uploads/" });

router.get("/", async (req, res, next) => {
	const query = req.query.query;
	const genre = req.query.genre;
	const skip = getPageSkip(req.query.page);

	try {
		let movies;
		if (!query && !genre) {
			movies = await Movie.find().limit(PER_PAGE).skip(skip).exec();
		} else {
			movies = await Movie.search(query, genre, skip);
		}

		res.json(movies);
	} catch (e) {
		return next(e);
	}
});

// create movie (protected)
// it will only accept multipart/form-data enctype because of file upload
router.post(
	"/",
	isUser,
	upload.single("poster"),
	createMovie,
	async (req, res, next) => {
		if (!req.file) {
			return next(createHttpError(400, "poster can not be empty"));
		}
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return next(
				APIError.withErrors("validation failed", errors.array())
			);
		}
		const poster = req.file;
		const movie = new Movie({ ...req.body, poster: poster.filename });
		try {
			await movie.save();
			res.json(movie);
		} catch (e) {
			next(e);
		}
	}
);

// (protected)
router.get("/:id/watchlist-toggle", isUser, async (req, res, next) => {
	const id = req.params.id;
	const user = req.user;

	user.toggleWatchlist(id);

	try {
		await user.save();
		res.json(user.watchlist);
	} catch (e) {
		next(e);
	}
});

// create review (protected)
router.post("/:id/review", isUser, createReview, async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(APIError.withErrors("validation failed", errors.array()));
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
		res.json(review);
	} catch (e) {
		next(e);
	}
});

router.get("/:id", async (req, res, next) => {
	const id = req.params.id;
	try {
		const movie = await Movie.findById(id)
			.populate("directors")
			.populate("writers")
			.populate("actors");
		if (!movie) throw createHttpError(404);

		const reviews = await Review.find().where("movie", id).populate("user");

		const pMovie = movie.toObject();
		pMovie.reviews = reviews;

		return res.json(pMovie);
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
