var express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../../lib/mongoose/user");
const { signUser } = require("../../lib/jwt");
const createHttpError = require("http-errors");
var router = express.Router();

router.get("/sign-up", async (req, res, next) => {
	res.render("users/signUp", { title: "Sign-up" });
});

router.post(
	"/sign-up",
	body("name").notEmpty(),
	body("username").notEmpty(),
	body("password").notEmpty(),
	async (req, res, next) => {
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
	}
);

router.get("/sign-in", async (req, res, next) => {
	res.render("users/signIn", { title: "Sign-in" });
});

router.post(
	"/sign-in",
	body("username").notEmpty(),
	body("password").notEmpty(),
	async (req, res, next) => {
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
	}
);

router.use("/", require("./protected"));

// this is intentionally below the router.use statement due to specificity issues
router.get("/:id", async (req, res, next) => {
	const id = req.params.id;
	try {
		const user = await User.findById(id).populate("watchlist");
		if (!user) throw "not found";
		return res.render("users/single", { title: user.name, user });
	} catch (e) {
		return next(createHttpError(404));
	}
});

module.exports = router;
