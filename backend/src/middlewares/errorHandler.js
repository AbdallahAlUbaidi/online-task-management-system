import ApiError from "../api/ApiError.js";

export default (error, req, res, next) => {
	if (error instanceof ApiError) {
		const { httpStatusCode, message } = error;
		res.status(httpStatusCode).json({ message });
	}
	next(error);
};