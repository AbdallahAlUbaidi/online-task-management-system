export class Request {
	constructor(body = {}, headers = {}) {
		this.body = body;
		this.headers = headers;
	}
}

export class Response {
	constructor(body = {}, headers = {}) {
		this.body = body;
		this.headers = headers;
		this.statusCode = 200;
	}

	json(content) {
		this.body = content;
		this.headers["content-type"] = "application/json";
		return this;
	}

	status(statusCode) {
		this.statusCode = statusCode;
		return this;
	}

	sendStatus(statusCode) {
		this.statusCode = statusCode;
		return this;
	}
}