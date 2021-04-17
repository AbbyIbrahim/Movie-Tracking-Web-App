var express = require("express");
var router = express.Router();

router.use("/users", require("./users/index"));
router.use("/movies", require("./movies/index"));
router.use("/persons", require("./persons/index"));

// API error handler
router.use(function (err, req, res, next) {
	res.status(err.status || 500);
	res.json({
		status: "error",
		message: err.message,
		errors: err.errors || [],
	});
});

module.exports = router;
