var express = require("express");
var router = express.Router();

router.use("/persons", require("./persons"));
module.exports = router;
