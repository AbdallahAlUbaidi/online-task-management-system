import { vi, expect, it, describe, beforeEach, } from "vitest";

import generateFakeJWT from "../../helpers/generateFakeJWT.js";
import generateFakeMongooseId from "../../helpers/generateFakeMongooseId.js";

import {
	Request,
	Response
} from "../../mocks/express.js";

import initializeAuthenticate from "../authenticate";

describe("authenticate middleware function", () => {
	let req, res, next, authenticate, getUserById, verifyToken;
	beforeEach(() => {
		req = new Request();
		res = new Response();
		next = vi.fn();
		getUserById = vi.fn();

		verifyToken = vi.fn();

		authenticate = initializeAuthenticate({ getUserById, verifyToken });
	});

	it("Should respond with 401 if token is not found in authentication header", async () => {
		//Arrange
		req.headers["Authorization"] = undefined;

		//Act
		await authenticate(req, res, next);

		//Assert
		expect(res.statusCode).toBe(401);
	});

	it("Should respond with 401 if the token in the authentication header is invalid", async () => {
		//Arrange
		verifyToken.mockImplementationOnce(() =>
			Promise.resolve(false));

		//Act
		await authenticate(req, res, next);

		//Assert
		expect(res.statusCode).toBe(401);
	});

	it("Should respond with 401 if the user id in the authentication header does not belong to any user", async () => {
		//Arrange
		verifyToken.mockImplementationOnce(() =>
			new Promise.resolve({ sub: generateFakeMongooseId }));

		getUserById.mockImplementationOnce(() =>
			new Promise.resolve(null));

		//Act
		await authenticate(req, res, next);

		//Assert
		expect(res.statusCode).toBe(401);

	});

	it("Should attach use data to req.user if valid user is found and call next", async () => {
		//Arrange
		verifyToken.mockImplementationOnce(() =>
			Promise.resolve({ sub: generateFakeMongooseId() }));
		getUserById.mockImplementationOnce(() =>
			Promise.resolve({
				_id: generateFakeMongooseId(),
			}));
		req.headers["authorization"] = `bearer ${await generateFakeJWT()}`;

		//Act
		await authenticate(req, res, next);

		//Assert
		expect(req.user).toStrictEqual(getUserById.mock.results[0].value);
		expect(next).toBeCalledTimes(1);

	});
});