var express = require("express");
const FileType = require("file-type");
const path = require("path");
const fs = require("fs");
const User = require("../lib/mongoose/user");
const { verifyUser } = require("./../lib/jwt");
const Movie = require("../lib/mongoose/movie");
var router = express.Router();

// set user, if available
router.use(async (req, res, next) => {
	if (req.user) return next();
	const token = req.cookies.auth;
	if (token) {
		const userToken = verifyUser(token);
		const user = await User.findById(userToken.subject);
		req.user = user;
		res.locals.user = user;
	}
	return next();
});

router.get("/", async function (req, res, next) {
	const user = req.user;
	let movies;
	if (user && user.watchlist.length) {
		movies = await user.movieSuggestions();
	} else {
		movies = await Movie.find().limit(4);
	}
	res.render("index", { title: "Home", movies });
});

// serve the uploads
router.get("/uploads/:name", async (req, res) => {
	const name = req.params.name;

	const file = path.resolve(__dirname, "../uploads", name);
	if (!fs.existsSync(file)) {
		res.status(404);
		return res.send("404");
	}

	const fileType = await FileType.fromFile(file);
	if (!fileType) {
		res.status(401);
		return res.send("401");
	}

	res.type(fileType.mime);
	res.sendFile(file);
});

// API Routes
router.use("/api", require("./api/index"));
// HTML Routes
router.use("/users", require("./users/index"));
router.use("/movies", require("./movies/index"));
router.use("/persons", require("./persons/index"));
module.exports = router;
