var jwt = require("jsonwebtoken");

const SECRET = "some-cool-secret";

const signUser = (user) => {
	return jwt.sign(
		{
			subject: user._id,
		},
		SECRET
	);
};

const verifyUser = (token) => {
	return jwt.verify(token, SECRET);
};

module.exports = { signUser, verifyUser };
