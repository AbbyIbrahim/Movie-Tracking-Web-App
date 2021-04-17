const mongoose = require("mongoose");
const { info } = require("./log");
mongoose.connect("mongodb://localhost/spirex", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
	info("db connected!");
});

module.exports = db;
