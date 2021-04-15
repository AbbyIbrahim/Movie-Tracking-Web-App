const express = require("express");
const { validationResult } = require("express-validator");
const createHttpError = require("http-errors");
const User = require("../../../lib/mongoose/user");
const { signUser } = require("../../../lib/jwt");
const { createUser, signInUser } = require("../../middlewares/validations");
const APIError = require("../../../lib/apiError");
const Review = require("../../../lib/mongoose/review");
const isUser = require("../../middlewares/isUser");

const router = express.Router();

router.post("/", createUser, async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(APIError.withErrors("validation failed", errors.array()));
	}
	const user = new User({
		name: req.body.name,
		username: req.body.username,
		password: req.body.password,
	});
	try {
		await user.save();
		res.json(user.toSafeObject());
	} catch (e) {
		next(e);
	}
});

router.post("/sign-in", signInUser, async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(APIError.withErrors("validation failed", errors.array()));
	}
	const { username, password } = req.body;
	const user = await User.findOne()
		.where("username", username)
		.where("password", password);

	if (!user) {
		return next(APIError.withErrors("incorrect username/password"));
	}

	try {
		const token = signUser(user);
		res.json({ token });
	} catch (e) {
		next(e);
	}
});

router.get("/current", isUser, async (req, res, next) => {
	try {
		const user = req.user;
		res.json(await user.toPublicObject());
	} catch (e) {
		next(e);
	}
});

router.get("/:id", async (req, res, next) => {
	const id = req.params.id;
	try {
		const user = await User.findById(id);

		if (!user) throw createHttpError(404);

		res.json(await user.toPublicObject());
	} catch (e) {
		next(e);
	}
});

module.exports = router;
