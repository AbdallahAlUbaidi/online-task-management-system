import { expect, describe, it, vi, test, beforeEach, afterEach } from "vitest";
import express from "express";
import supertest from "supertest";

import {
	initializePostRegisterController
} from "../auth.js";


describe("postRegisterController callback initialization function", () => {

	const postRegisterController = initializePostRegisterController({});

	it("should return a defined value", () =>
		expect(postRegisterController).toBeDefined());

	it("should return a function", () =>
		expect(typeof postRegisterController).toBe("function"));

	it("function should have two arguments", () =>
		expect(postRegisterController.length).toBe(2));

});


describe("postRegisterController callback", () => {
	let createUser, getUserByName, getUserByEmail, hashPassword,
		validateUsername, validateEmail, validatePassword,
		postRegisterController, mockApp, request;

	beforeEach(() => {
		createUser = vi.fn();
		getUserByName = vi.fn(username => new Promise(resolve => {
			setTimeout(() => {
				if (/used/gi.test(username))
					resolve({
						username,
						email: "email",
						password: "$hash$"
					});
				else resolve(undefined);
			});
		}));
		getUserByEmail = vi.fn(email => new Promise(resolve => {
			setTimeout(() => {
				if (/used/gi.test(email))
					resolve({
						username: "username",
						email,
						password: "$hash$"
					});
				else resolve(undefined);
			});
		}));
		hashPassword = vi.fn(pass => pass);
		validateUsername = vi.fn(username => !/invalid/gi.test(username));
		validateEmail = vi.fn(email => !/invalid/gi.test(email));
		validatePassword = vi.fn(password => !/invalid/gi.test(password));

		postRegisterController = initializePostRegisterController({
			createUser,
			getUserByName,
			getUserByEmail,
			hashPassword,
			validateUsername,
			validateEmail,
			validatePassword
		});

		mockApp = express();

		mockApp.use(express.json());
		mockApp.use(postRegisterController);

		request = supertest(mockApp);

	});

	afterEach(() => vi.resetAllMocks());

	describe("In case of Valid input", () => {

		it("should hash the password", async () => {
			//Set up
			hashPassword.mockImplementation(pass => new Promise(resolve => {
				setTimeout(() => resolve("$hashed$" + pass), 100);
			}));

			//Action
			await request
				.post("/")
				.send({ username: "username", email: "email", password: "password" });
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
				//Action

				createUser.mockClear();
				await request
					.post("/")
					.send(body);

				//Expectations
				expect(createUser).toBeCalledTimes(1);
				expect(createUser.mock.calls[0][0].username).toBe(body.username);
				expect(createUser.mock.calls[0][0].email).toBe(body.email);
				expect(createUser.mock.calls[0][0].password).toBe(body.password);
				expect(createUser.mock.results[0].value).not.toBeInstanceOf(Promise);
			}
		}, 1000);

		it("should respond with status of 201", async () => {
			const response = await request
				.post("/")
				.send({ username: "username", email: "email", password: "password" });
			expect(response.statusCode).toBe(201);

		}, 1000);
	});

	describe("In case of invalid input", () => {

		it("should respond with 400 status code and a json containing a message", async () => {
			const invalidData = {
				username: "invalid username",
				email: "invalid email",
				password: "invalid password"
			};

			//Action 
			const response = await request
				.post("/")
				.send(invalidData);

			//Expectations
			expect(response.statusCode).toBe(400);
			expect(response.headers["content-type"]).toMatch(/json/gi);
			expect(response.body.message).toBeDefined();

		});

		it("if username is invalid the response message should indicate it", async () => {
			const invalidData = {
				username: "invalid username",
				email: "email",
				password: "password"
			};

			//Action 
			const response = await request
				.post("/")
				.send(invalidData);

			expect(response.body.message).toMatch(/invalid username/gi);
		});

		it("if the username is already in use the response message should indicate it", async () => {
			// Set up

			const data = {
				username: "used Username",
				email: "email",
				password: "password"
			};

			//Action
			getUserByName.mockClear();

			const response = await request
				.post("/")
				.send(data);

			//Expectations
			expect(getUserByName).toBeCalledTimes(1);
			expect(getUserByName.mock.calls[0][0]).toBe(data.username);
			expect(getUserByName.mock.results[0].value).not.toBeInstanceOf(Promise);
			expect(response.headers["content-type"]).toMatch(/json/gi);
			expect(response.statusCode).toBe(400);
			expect(response.body.message).toMatch(/username already exists/gi);
		}, 1000);

		it("if email is invalid the response message should indicate it", async () => {
			const invalidData = {
				username: "username",
				email: "invalid email",
				password: "password"
			};

			//Action 
			const response = await request
				.post("/")
				.send(invalidData);

			expect(response.body.message).toMatch(/invalid email/gi);
		});

		it("if the email is already in use the response message should indicate it", async () => {
			//Set up

			const data = {
				username: "username",
				email: "used email",
				password: "password"
			};

			//Action
			getUserByEmail.mockClear();

			const response = await request
				.post("/")
				.send(data);

			//Expectations
			getUserByName.mockClear();
			expect(getUserByEmail).toBeCalledTimes(1);
			expect(getUserByEmail.mock.calls[0][0]).toBe(data.email);
			expect(getUserByEmail.mock.results[0].value).not.toBeInstanceOf(Promise);
			expect(response.headers["content-type"]).toMatch(/json/gi);
			expect(response.statusCode).toBe(400);
			expect(response.body.message).toMatch(/email already exists/gi);


		}, 1000);

		it("if password is not strong enough the response message should indicate it", async () => {
			const invalidData = {
				username: "username",
				email: "email",
				password: "invalid password"
			};

			//Action 
			const response = await request
				.post("/")
				.send(invalidData);

			expect(response.body.message).toMatch(/password is not strong enough/gi);
		});

	});

	describe("In case database operation failure", () => {
		//Set up
		let data;
		beforeEach(() => data = {
			username: "username",
			email: "email",
			password: "password"
		});

		test("should handle createUser failure", async () => {
			//Set up

			createUser.mockImplementation(() =>
				new Promise((resolve, reject) => {
					setTimeout(() => reject(new Error("failed to create user")));
				}));

			//Action

			const response = await request
				.post("/")
				.send(data);

			//Expectations
			expect(response.statusCode).toBe(500);
			expect(response.headers["content-type"]).toMatch(/json/gi);
			expect(response.body.message).toMatch(/Internal server error/gi);

		}, 1000);

		test("should handle getUserByName failure", async () => {
			//Set up
			getUserByName.mockImplementation(() =>
				new Promise((resolve, reject) => {
					setTimeout(() => reject(new Error("failed to get user")));
				}));

			//Action

			const response = await request
				.post("/")
				.send(data);

			//Expectations
			expect(response.statusCode).toBe(500);
			expect(response.headers["content-type"]).toMatch(/json/gi);
			expect(response.body.message).toMatch(/Internal server error/gi);
		}, 1000);

		test("should handle getUserByEmail failure", async () => {
			//Set up
			getUserByEmail.mockImplementation(() =>
				new Promise((resolve, reject) => {
					setTimeout(() => reject(new Error("failed to get user")));
				}));

			//Action

			const response = await request
				.post("/")
				.send(data);

			//Expectations
			expect(response.statusCode).toBe(500);
			expect(response.headers["content-type"]).toMatch(/json/gi);
			expect(response.body.message).toMatch(/Internal server error/gi);
		}, 1000);

	});
});