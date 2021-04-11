var jwt = require("jsonwebtoken");

const SECRET = "some-cool-secret";

const signUser = (user) => {
	return jwt.sign(
		{
			subject: user._id,
			user: {
				name: user.name,
				username: user.username,
				isContributor: user.isContributor ? 1 : 0,
			},
		},
		SECRET
	);
};

const verifyUser = (token) => {
	return jwt.verify(token, SECRET);
};

module.exports = { signUser, verifyUser };
