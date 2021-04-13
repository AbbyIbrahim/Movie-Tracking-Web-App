var express = require("express");
const createHttpError = require("http-errors");
const Movie = require("../../lib/mongoose/movie");
const Review = require("../../lib/mongoose/review");
var router = express.Router();

router.get("/", async (req, res, next) => {
	const movies = await Movie.find();
	res.render("movies/list", { title: "Movies", movies });
});

router.get("/:id", async (req, res, next) => {
	const id = req.params.id;
	try {
		const movie = await Movie.findById(id)
			.populate("directors")
			.populate("writers")
			.populate("actors");
		if (!movie) throw "not found";

		const reviews = await Review.find().where("movie", id).populate("user");

		return res.render("movies/single", {
			title: movie.title,
			movie,
			reviews,
			isUser: !!req.user,
		});
	} catch (e) {
		return next(createHttpError(404));
	}
});

router.use("/", require("./userRoutes"));
module.exports = router;
