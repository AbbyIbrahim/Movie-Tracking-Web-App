var express = require("express");
const isUser = require("./isUser");
var router = express.Router();

router.use(isUser);

router.get("/dashboard", async (req, res, next) => {
	res.render("users/dashboard", { title: "Dashboard" });
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

router.use("/", require("./contribute"));
module.exports = router;
