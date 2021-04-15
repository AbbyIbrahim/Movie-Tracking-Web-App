class APIError {
	static withErrors(msg, errors = [], status = 400) {
		const err = new Error(msg);
		err.errors = errors;
		err.status = status;
		return err;
	}
}

module.exports = APIError;
