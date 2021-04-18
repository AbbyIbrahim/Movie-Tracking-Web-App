var express = require("express");
const createHttpError = require("http-errors");
const { PER_PAGE } = require("../../constants");
const Movie = require("../../lib/mongoose/movie");
const Review = require("../../lib/mongoose/review");
const { getPageSkip, getPageHref } = require("../../lib/utils");
var router = express.Router();

router.get("/", async (req, res, next) => {
	const skip = getPageSkip(req.query.page);

	const movies = await Movie.find().limit(PER_PAGE).skip(skip).exec();

	res.render("movies/list", {
		title: "Movies",
		movies,
		nextLink: getPageHref("next", req.originalUrl, req.query.page),
		prevLink: getPageHref("prev", req.originalUrl, req.query.page),
	});
});

router.get("/search", async (req, res, next) => {
	const query = req.query.query;
	const genre = req.query.genre;
	const skip = getPageSkip(req.query.page);

	try {
		if (!query && !genre) throw "";

		// if both query & genre are provided, every movie must match them
		let movies = await Movie.search(query, genre, skip);

		res.render("movies/list", {
			title: "Search",
			movies,
			query,
			genre,
			nextLink: getPageHref("next", req.originalUrl, req.query.page),
			prevLink: getPageHref("prev", req.originalUrl, req.query.page),
		});
	} catch (e) {
		return next(createHttpError(404));
	}
});

router.get("/:id", async (req, res, next) => {
	const id = req.params.id;
	try {
		const movie = await Movie.findById(id)
			.populate("directors")
			.populate("writers")
			.populate("actors");
		if (!movie) throw "not found";

		const similar = await movie.findSimilar();

		const reviews = await Review.find().where("movie", id).populate("user");

		return res.render("movies/single", {
			title: movie.title,
			movie,
			reviews,
			similar,
			isUser: !!req.user,
		});
	} catch (e) {
		return next(createHttpError(404));
	}
});

router.use("/", require("./userRoutes"));
module.exports = router;
