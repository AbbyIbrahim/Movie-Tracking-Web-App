const express = require("express");
const { validationResult } = require("express-validator");
const createHttpError = require("http-errors");
const User = require("../../../lib/mongoose/user");
const { signUser } = require("../../../lib/jwt");
const { createUser, signInUser } = require("../../middlewares/validations");
const APIError = require("../../../lib/apiError");
const isUser = require("../../middlewares/isUser");
const { PER_PAGE } = require("../../../constants");
const { getPageSkip } = require("../../../lib/utils");

const router = express.Router();

// get users
router.get("/", async (req, res, next) => {
	const username = req.query.username;
	try {
		let users = User.find();
		if (username) {
			users = users.where("username", new RegExp(username, "i"));
		}

		users.limit(PER_PAGE).skip(getPageSkip(req.query.page));

		const pUsers = (await users).map((user) => {
			return user.toSafeObject();
		});
		res.json(pUsers);
	} catch (e) {
		next(e);
	}
});

// create user
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

// generate token for authentication
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

// follow toggle user (protected)
router.get("/:id/follow-toggle", isUser, async (req, res, next) => {
	const id = req.params.id;
	const user = req.user;

	user.toggleFollowUser(id);

	try {
		await user.save();
		res.json(user.followingUsers);
	} catch (e) {
		next(e);
	}
});

// get the user notifications (protected)
router.get("/notifications", isUser, async (req, res, next) => {
	const user = req.user;
	try {
		res.json(user.notifications);
	} catch (e) {
		next(e);
	}
});

// get logged user (protected)
router.get("/current", isUser, async (req, res, next) => {
	try {
		const user = req.user;
		res.json(await user.toPublicObject());
	} catch (e) {
		next(e);
	}
});

// update logged user (protected)
router.put("/:id", isUser, async (req, res, next) => {
	const user = req.user;
	try {
		const { name, username, password } = req.body;
		if (name) user.name = name;
		if (username) user.username = username;
		if (password) user.password = password;

		await user.save();

		res.json(await user.toSafeObject());
	} catch (e) {
		next(e);
	}
});

// get user
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
