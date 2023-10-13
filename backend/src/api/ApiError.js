export default class ApiError extends Error {
	constructor(errorCode, message, httpStatusCode) {
		super(message);
		this.errorCode = errorCode;
		this.httpStatusCode = httpStatusCode;
	}
}