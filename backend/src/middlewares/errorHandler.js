import ApiError from "../api/ApiError.js";

export default (error, req, res) => {
	if (error instanceof ApiError) {
		const { httpStatue, message } = error;
		res.status(httpStatue).json({ message });
	}
};