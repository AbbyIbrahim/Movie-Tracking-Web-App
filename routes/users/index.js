var express = require("express");
const { validationResult } = require("express-validator");
const User = require("../../lib/mongoose/user");
const Review = require("../../lib/mongoose/review");
const { signUser } = require("../../lib/jwt");
const { createUser, signInUser } = require("../middlewares/validations");
const createHttpError = require("http-errors");
var router = express.Router();

router.get("/sign-up", async (req, res, next) => {
	res.render("users/signUp", { title: "Sign-up" });
});

router.post("/sign-up", createUser, async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.render("errors", {
			title: "Error",
			msg: "validation failed",
			errors: errors.array(),
		});
	}
	const user = new User({
		name: req.body.name,
		username: req.body.username,
		password: req.body.password,
	});
	try {
		await user.save();
		res.redirect("/users/sign-in");
	} catch (e) {
		next(e);
	}
});

router.get("/sign-in", async (req, res, next) => {
	res.render("users/signIn", { title: "Sign-in" });
});

router.post("/sign-in", signInUser, async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.render("errors", {
			title: "Error",
			msg: "validation failed",
			errors: errors.array(),
		});
	}
	const { username, password } = req.body;
	const user = await User.findOne()
		.where("username", username)
		.where("password", password);

	if (!user) {
		return res.render("errors", {
			title: "Error",
			msg: "incorrect username/password",
		});
	}
	const token = signUser(user);

	res.cookie("auth", token);
	res.redirect("/users/dashboard");
});

router.get("/:id/profile", async (req, res, next) => {
	const id = req.params.id;
	try {
		const pUser = await User.findById(id)
			.populate("watchlist")
			.populate("followingPersons")
			.populate("followingUsers");

		if (!pUser) throw "not found";
		const reviews = await Review.find()
			.where("user", pUser._id)
			.populate("movie");
		return res.render("users/single", {
			title: pUser.name,
			pUser,
			reviews,
			isOwnProfile: pUser.equals(req.user),
			isFollowing:
				req.user && req.user.followingUsers.includes(pUser._id),
		});
	} catch (e) {
		return next(createHttpError(404));
	}
});

router.use("/", require("./protected"));
module.exports = router;
