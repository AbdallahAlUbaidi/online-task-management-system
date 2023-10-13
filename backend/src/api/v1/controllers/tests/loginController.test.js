import { vi, it, describe, beforeEach, expect } from "vitest";

import {
	initializePostLoginController
} from "../auth.js";

import ApiError from "../../../ApiError.js";

import {
	INVALID_CREDENTIALS
} from "../../../../constants/apiErrorCodes.js";


describe("postLoginController callback initialization function", () => {
	it("should return a defined value", () =>
		expect(initializePostLoginController({})).toBeDefined());

	it("should return a function", () =>
		expect(typeof initializePostLoginController).toBe("function"));

	it("the return callback should have 3 arguments", () =>
		expect(initializePostLoginController({}).length).toBe(3));
});


describe("postLoginController callback", () => {

	let getUserByName, comparePasswords, issueToken, postLoginController,
		req, res, next;
	let UserModel = {};

	beforeEach(() => {
		UserModel.findOne = vi.fn(({ username }) => new Promise(resolve => {
			setTimeout(() => {
				const id = String(Math.floor(Math.random() * 100000));
				if (/existing/gi.test(username))
					resolve({
						_id: `ObjectId("${id}")`,
						id,
						username,
						email: "email",
						password: "$hash$password"
					});
				else resolve(undefined);
			}, 100);
		}));

		getUserByName = vi.fn(async ({ username, UserModel }) => UserModel.findOne({ username }));

		comparePasswords = vi.fn((password, hash) => new Promise(resolve => {
			setTimeout(() => {
				resolve(hash.split("$").includes(password));
			}, 100);
		}));

		issueToken = vi.fn(userId => new Promise(resolve => {
			setTimeout(() => {
				resolve(`$signedToken:${userId}$`);
			}, 100);
		}));

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


		req = new Request();
		res = new Response();
		next = vi.fn();

		postLoginController = initializePostLoginController({
			getUserByName,
			comparePasswords,
			issueToken,
			UserModel
		});
	});

	it("should pass an api invalid credentials error with 400 http status when the user is not found", async () => {
		// Set up
		const mockData = [
			{ username: "username1", password: "password1" },
			{ username: "username2", password: "password2" },
			{ username: "username3", password: "password3" }
		];

		for (let body of mockData) {
			getUserByName.mockClear();
			next.mockClear();
			req.body = body;

			await postLoginController(req, res, next);

			expect(getUserByName).toBeCalledTimes(1);
			expect(getUserByName.mock.calls[0][0].username).toBe(body.username);
			expect(getUserByName.mock.results[0].value).not.toBeInstanceOf(Promise);
			expect(next).toBeCalledTimes(1);
			const err = next.mock.calls[0][0];
			expect(err).toBeInstanceOf(ApiError);
			expect(err.httpStatusCode).toBe(400);
			expect(err.errorCode).toBe(INVALID_CREDENTIALS);

		}


	}, 1000);

	it("should pass an api invalid credentials and 400 http status when user is found but password is incorrect", async () => {

		// Set up
		const mockData = [
			{ username: "existing username1", password: "password1" },
			{ username: "existing username2", password: "password2" },
			{ username: "existing username3", password: "password3" }
		];

		for (let body of mockData) {
			getUserByName.mockClear();
			comparePasswords.mockClear();
			next.mockClear();
			req.body = body;

			await postLoginController(req, res, next);

			const user = getUserByName.mock.results[0].value;
			expect(user.username).toBe(body.username);
			expect(comparePasswords).toBeCalledTimes(1);
			expect(comparePasswords.mock.calls[0][0]).toBe(body.password);
			expect(comparePasswords.mock.calls[0][1]).toBe(user.password);

			expect(next).toBeCalledTimes(1);
			const err = next.mock.calls[0][0];
			expect(err).toBeInstanceOf(ApiError);
			expect(err.httpStatusCode).toBe(400);
			expect(err.errorCode).toBe(INVALID_CREDENTIALS);

		}

	}, 1000);

	it("should respond with 200 status and json containing token", async () => {

		// Set up
		const mockData = [
			{ username: "existing username1", password: "password" },
			{ username: "existing username2", password: "password" },
			{ username: "existing username3", password: "password" }
		];

		for (let body of mockData) {
			getUserByName.mockClear();
			comparePasswords.mockClear();
			issueToken.mockClear();
			next.mockClear();
			req.body = body;

			await postLoginController(req, res, next);

			const user = getUserByName.mock.results[0].value;
			expect(issueToken).toBeCalledTimes(1);
			expect(issueToken.mock.calls[0][0]).toBe(user.id);
			const token = issueToken.mock.results[0].value;
			expect(token).not.toBeInstanceOf(Promise);
			expect(res.statusCode).toBe(200);
			expect(res.headers["content-type"]).toMatch(/json/gi);
			expect(res.body.token).toBe(token);
		}
	}, 1000);

});