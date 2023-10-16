import { vi, describe, it, expect, beforeEach } from "vitest";

import { faker } from "@faker-js/faker";

import {
	Request,
	Response
} from "../../../../mocks/express.js";

import generateFakeMongooseId from "../../../../helpers/generateFakeMongooseId.js";


import ApiError from "../../../ApiError.js";

import {
	INVALID_ID,
	UNAUTHORIZED
} from "../../../../constants/apiErrorCodes.js";

import {
	initializeGetTaskController
} from "../task.js";

describe("getTask controller", () => {
	let getTaskById, req, res, next,
		TaskModel, getTaskController,
		validateDatabaseId;

	beforeEach(() => {
		req = new Request();
		res = new Response();
		next = vi.fn();

		TaskModel = {};
		getTaskById = vi.fn();
		validateDatabaseId = vi.fn(() => true);

		getTaskController = initializeGetTaskController({
			TaskModel,
			getTaskById,
			validateDatabaseId
		});

	});

	it("Should respond with status 200 and task object given taskId", async () => {
		//Arrange
		req.params = {
			taskId: generateFakeMongooseId(),
		};
		const userId = generateFakeMongooseId();
		req.user = { _id: userId };

		const taskObj = {
			userId,
			title: faker.lorem.sentence,
		};

		getTaskById.mockImplementationOnce(({ taskId }) =>
			Promise.resolve({
				...taskObj,
				_id: taskId
			}));

		//Act
		await getTaskController(req, res, next);

		//Assert
		expect(res.statusCode).toBe(200);
		expect(res.body).toStrictEqual({
			...taskObj,
			_id: req.params.taskId
		});
	});

	it("Should respond with status 404 when not task is found with the specified taskId", async () => {
		//Arrange
		getTaskById.mockImplementationOnce(() =>
			Promise.resolve(null));

		req.params = { taskId: generateFakeMongooseId() };

		//Act
		await getTaskController(req, res, next);

		//Assert
		expect(res.statusCode).toBe(404);

	});

	it("Should pass an api unauthorized error if the user does not own the task", async () => {
		//Arrange
		const taskId = generateFakeMongooseId();

		req.params = { taskId };

		const taskObj = {
			title: faker.lorem.sentence(),
			userId: generateFakeMongooseId()
		};

		getTaskById.mockImplementationOnce(({ taskId }) =>
			Promise.resolve({
				_id: taskId,
				...taskObj
			}));

		req.user = {};
		while (req.user._id === taskObj.userId)
			req.user._id = generateFakeMongooseId();

		//Act
		await getTaskController(req, res, next);

		//Assert
		expect(next).toHaveBeenCalledOnce();
		const err = next.mock.calls[0][0];
		expect(err).toBeInstanceOf(ApiError);
		expect(err.errorCode).toBe(UNAUTHORIZED);
		expect(err.httpStatusCode).toBe(403);
	});

	it("Should pass an api invalid id error to next if not task id is passed", async () => {
		//Arrange
		req.params = {};
		validateDatabaseId.mockImplementationOnce(() => false);

		//Act
		await getTaskController(req, res, next);

		//Assert
		expect(next).toHaveBeenCalledOnce();
		const err = next.mock.calls[0][0];
		expect(err).toBeInstanceOf(ApiError);
		expect(err.errorCode).toBe(INVALID_ID);
		expect(err.httpStatusCode).toBe(400);
	});

	it("Should pass an api invalid id if error to next if the passed task id is not a valid database id", async () => {
		//Arrange
		req.params = { taskId: faker.lorem.sentence() };
		validateDatabaseId.mockImplementationOnce(() => false);

		//Act
		await getTaskController(req, res, next);

		//Assert
		expect(next).toHaveBeenCalledOnce();
		const err = next.mock.calls[0][0];
		expect(err).toBeInstanceOf(ApiError);
		expect(err.errorCode).toBe(INVALID_ID);
		expect(err.httpStatusCode).toBe(400);


	});
});