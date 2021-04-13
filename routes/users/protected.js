var express = require("express");
const Movie = require("../../lib/mongoose/movie");
const User = require("../../lib/mongoose/user");
const isUser = require("../middlewares/isUser");
var router = express.Router();

router.use(isUser);

router.get("/dashboard", async (req, res, next) => {
	res.render("users/dashboard", { title: "Dashboard" });
});

router.get("/notifications", async (req, res, next) => {
	const user = req.user;
	const notifications = [];

	// load notifications
	for await (let noti of user.notifications) {
		if (noti.type === "review") {
			const movie = await Movie.findById(noti.movie);
			const user = await User.findById(noti.user);
			notifications.push(
				`<a href="/users/${user._id}/profile">${user.name}</a> reviewed <a href="/movies/${movie._id}/">${movie.title}</a>`
			);
		}
	}

	// delete notifications
	user.notifications = [];
	await user.save();

	res.render("users/notifications", {
		title: "Notifications",
		notifications,
	});
});

router.get("/profile", async (req, res) => {
	res.render("users/profile", { title: "Profile" });
});

router.post("/profile", async (req, res, next) => {
	const { name, username, password, isContributor } = req.body;
	const { user } = req;
	user.name = name;
	user.username = username;
	if (password) {
		user.password = password;
	}
	user.isContributor = isContributor ? true : false;
	try {
		await user.save();
		return res.redirect("/users/profile");
	} catch (e) {
		next(e);
	}
});

router.get("/logout", async (req, res, next) => {
	res.clearCookie("auth");
	res.redirect("/");
});

router.get("/:id/follow-toggle", async (req, res, next) => {
	const id = req.params.id;
	const user = req.user;

	const index = user.followingUsers.indexOf(id);
	// if exists, remove otherwise add it
	if (index > -1) {
		user.followingUsers.splice(index, 1);
	} else {
		user.followingUsers.push(id);
	}

	try {
		await user.save();
		res.redirect("/users/" + id + "/profile");
	} catch (error) {
		next(error);
	}
});

router.use("/", require("./contribute"));
module.exports = router;
