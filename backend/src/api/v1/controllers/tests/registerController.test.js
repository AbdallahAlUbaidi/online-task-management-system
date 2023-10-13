import { expect, describe, it, vi, beforeEach, afterEach } from "vitest";


import {
	initializePostRegisterController
} from "../auth.js";

import ApiError from "../../../ApiError.js";

import {
	VALIDATION_ERROR,
} from "../../../../constants/apiErrorCodes.js";


describe("postRegisterController callback initialization function", () => {

	const postRegisterController = initializePostRegisterController({});

	it("should return a defined value", () =>
		expect(postRegisterController).toBeDefined());

	it("should return a function", () =>
		expect(typeof postRegisterController).toBe("function"));

	it("function should have three arguments", () =>
		expect(postRegisterController.length).toBe(3));

});


describe("postRegisterController callback", () => {
	let createUser, getUserByName, getUserByEmail, hashPassword,
		validateUsername, validateEmail, validatePassword,
		postRegisterController, req, res, next;
	
	let UserModel = {};

	beforeEach(() => {
		createUser = vi.fn();
		UserModel.findOne = vi.fn(({ username, email }) => new Promise(resolve => {
			setTimeout(() => {
				if (username) {
					if (/used/gi.test(username))
						resolve({
							username,
							email: "email",
							password: "$hash$"
						});
					else resolve(undefined);
				}

				if (email) {
					if (/used/gi.test(email))
						resolve({
							username: "username",
							email,
							password: "$hash$"
						});
					else resolve(undefined);
				}
			}, 100);
		}));

		getUserByName = vi.fn(async ({ username, UserModel }) => UserModel.findOne({ username }));
		getUserByEmail = vi.fn(async ({ email, UserModel }) => UserModel.findOne({ email }));
		hashPassword = vi.fn(pass => pass);
		validateUsername = vi.fn(username => !/invalid/gi.test(username));
		validateEmail = vi.fn(email => !/invalid/gi.test(email));
		validatePassword = vi.fn(password => !/invalid/gi.test(password));

		postRegisterController = initializePostRegisterController({
			createUser,
			getUserByName,
			getUserByEmail,
			UserModel,
			hashPassword,
			validateUsername,
			validateEmail,
			validatePassword
		});

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

	});

	afterEach(() => vi.resetAllMocks());

	describe("In case of Valid input", () => {

		it("should hash the password", async () => {
			//Set up
			hashPassword.mockImplementation(pass => new Promise(resolve => {
				setTimeout(() => resolve("$hashed$" + pass), 100);
			}));

			req.body = { username: "username", email: "email", password: "password" };

			//Action
			await postRegisterController(req, res, next);

			expect(hashPassword).toBeCalledTimes(1);
			expect(hashPassword.mock.results[0].value).not.toBeInstanceOf(Promise);
			expect(createUser.mock.calls[0][0].password).toBe("$hashed$" + "password");
		}, 1000);

		it("should save user to database", async () => {
			//Set up 
			createUser.mockImplementation(() => new Promise(resolve => {
				setTimeout(() => resolve({ id: 1 }), 100);
			}));

			const mockData = [
				{ username: "username1", email: "email1", password: "password1" },
				{ username: "username2", email: "email2", password: "password2" },
				{ username: "username3", email: "email3", password: "password3" },
			];

			for (let body of mockData) {
				req.body = body;

				//Action

				createUser.mockClear();
				await postRegisterController(req, res);

				//Expectations
				expect(createUser).toBeCalledTimes(1);
				expect(createUser.mock.calls[0][0].username).toBe(body.username);
				expect(createUser.mock.calls[0][0].email).toBe(body.email);
				expect(createUser.mock.calls[0][0].password).toBe(body.password);
				expect(createUser.mock.results[0].value).not.toBeInstanceOf(Promise);
			}
		}, 1000);

		it("should respond with status of 201", async () => {
			req.body = { username: "username", email: "email", password: "password" };
			await postRegisterController(req, res);
			expect(res.statusCode).toBe(201);

		}, 1000);
	});

	describe("In case of invalid input", () => {

		it("if username is invalid it should call next with an api validation error with http status code 400 and a message", async () => {
			req.body = {
				username: "invalid username",
				email: "email",
				password: "password"
			};

			await postRegisterController(req, res, next);

			expect(next).toBeCalledTimes(1);
			const err = next.mock.calls[0][0];
			expect(err).toBeInstanceOf(ApiError);
			expect(err.httpStatusCode).toBe(400);
			expect(err.errorCode).toBe(VALIDATION_ERROR);
			expect(err.message).toMatch(/Invalid user/gi);
		});

		it("if the username is already in use it should call next with an api validation error with http status code 400 and a message", async () => {
			// Set up

			req.body = {
				username: "used Username",
				email: "email",
				password: "password"
			};

			//Action
			getUserByName.mockClear();

			await postRegisterController(req, res, next);

			expect(getUserByName).toBeCalledTimes(1);
			expect(getUserByName.mock.calls[0][0].username).toBe(req.body.username);
			expect(getUserByName.mock.results[0].value).not.toBeInstanceOf(Promise);
			expect(next).toBeCalledTimes(1);
			const err = next.mock.calls[0][0];
			expect(err).toBeInstanceOf(ApiError);
			expect(err.httpStatusCode).toBe(400);
			expect(err.errorCode).toBe(VALIDATION_ERROR);
			expect(err.message).toMatch(/username already exists/gi);

		}, 1000);

		it("if the email is invalid it should call next with an api validation error with http status code 400 and a message", async () => {
			req.body = {
				username: "username",
				email: "invalid email",
				password: "password"
			};

			//Action 
			await postRegisterController(req, res, next);

			expect(next).toBeCalledTimes(1);
			const err = next.mock.calls[0][0];
			expect(err).toBeInstanceOf(ApiError);
			expect(err.httpStatusCode).toBe(400);
			expect(err.errorCode).toBe(VALIDATION_ERROR);
			expect(err.message).toMatch(/Invalid email/gi);
		});

		it("if the email is already in use it should call next with an api validation error with http status code 400 and a message", async () => {
			//Set up

			req.body = {
				username: "username",
				email: "used email",
				password: "password"
			};

			//Action
			getUserByEmail.mockClear();

			await postRegisterController(req, res, next);

			expect(getUserByEmail).toBeCalledTimes(1);
			expect(getUserByEmail.mock.calls[0][0].email).toBe(req.body.email);
			expect(getUserByEmail.mock.results[0].value).not.toBeInstanceOf(Promise);
			expect(next).toBeCalledTimes(1);
			const err = next.mock.calls[0][0];
			expect(err).toBeInstanceOf(ApiError);
			expect(err.httpStatusCode).toBe(400);
			expect(err.errorCode).toBe(VALIDATION_ERROR);
			expect(err.message).toMatch(/email already exists/gi);


		}, 1000);

		it("if password is not strong enough it should call next with an api validation error with http status code 400 and a message", async () => {
			req.body = {
				username: "username",
				email: "email",
				password: "invalid password"
			};

			//Action 
			await postRegisterController(req, res, next);

			expect(next).toBeCalledTimes(1);
			const err = next.mock.calls[0][0];
			expect(err).toBeInstanceOf(ApiError);
			expect(err.httpStatusCode).toBe(400);
			expect(err.errorCode).toBe(VALIDATION_ERROR);
			expect(err.message).toMatch(/Password not strong enough/gi);
		});

	});

});