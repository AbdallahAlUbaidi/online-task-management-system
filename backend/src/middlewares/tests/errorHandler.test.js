import { it, beforeEach, describe, vi, expect } from "vitest";

import errorHandler from "../errorHandler.js";

import ApiError from "../../api/ApiError";

import {
	VALIDATION_ERROR,
} from "../../constants/apiErrorCodes.js";

describe("Error handling middleware", () => {
	let req, res, error, next;

	beforeEach(() => {
		class Request {
			constructor(body = {}, headers = {}) {
				this.body = body;
				this.headers = headers;
			}
		}

		class Response {
			constructor(body = {}, headers = {}) {
				this.body = body;
				this.headers = headers;
				this.statusCode = 200;
			}

			json(data) {
				this.body = data;
				this.headers["content-type"] = "application/json";
				return this;
			}

			status(statusCode) {
				this.statusCode = statusCode;
				return this;
			}
		}

		req = new Request();
		res = new Response();
		next = vi.fn();
	});

	it("Should respond with the error status code and message if the error is instant of ApiError", () => {
		//Set up 
		const errors = [
			{ message: "Test Error1", status: 400 },
			{ message: "Test Error2", status: 401 },
			{ message: "Test Error3", status: 402 },
		];
		for (let err of errors) {
			next.mockClear();
			error = new ApiError(VALIDATION_ERROR, err.message, err.status);

			errorHandler(error, req, res, next);

			expect(res.headers["content-type"]).toMatch(/json/gi);
			expect(res.statusCode).toBe(err.status);
			expect(res.body.message).toBe(err.message);
			expect(next).not.toBeCalled();
		}
	});
	// Should forward the error if it is not an Api error

	it("Should forward the error if it is not an Api error", () => {
		const errors = [
			"Test Error1",
			"Test Error2",
			"Test Error3",
		];
		for (let err of errors) {
			next.mockClear();
			error = new Error(err);

			errorHandler(error, req, res, next);

			expect(next).toBeCalledTimes(1);
			expect(next.mock.calls[0][0]).toStrictEqual(new Error(err));
		}
	});

});