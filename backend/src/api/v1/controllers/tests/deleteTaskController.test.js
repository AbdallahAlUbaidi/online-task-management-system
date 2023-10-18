import { vi, describe, it, expect, beforeEach } from "vitest";

import generateFakeMongooseId from "../../../../helpers/generateFakeMongooseId.js";

import { faker } from "@faker-js/faker";



import {
	Request,
	Response
} from "../../../../mocks/express.js";

import {
	initializeDeleteTaskController
} from "../task.js";

import ApiError from "../../../ApiError.js";
import {
	NOT_FOUND_ERROR,
	UNAUTHORIZED,
	UNAUTHENTICATED_ERROR,
	INVALID_ID
} from "../../../../constants/apiErrorCodes.js";


describe("Delete task controller", () => {

	let req, res, next,
		deleteTaskController, TaskModel,
		validateDatabaseId,
		deleteTaskService,
		getTaskById;


	beforeEach(() => {
		req = new Request();
		res = new Response();
		next = vi.fn();

		deleteTaskService = vi.fn();
		TaskModel = {};
		validateDatabaseId = vi.fn(() => true);
		getTaskById = vi.fn();

		deleteTaskController = initializeDeleteTaskController({
			TaskModel,
			validateDatabaseId,
			deleteTaskService,
			getTaskById
		});

		req.user = { _id: generateFakeMongooseId() };
		req.params = {};

	});

	it("Should delete a task given a valid task id", async () => {
		//Arrange
		req.params.taskId = generateFakeMongooseId();

		const taskObj = {
			title: faker.lorem.sentence(),
			userId: req.user._id,
		};

		getTaskById.mockImplementationOnce(({ taskId }) =>
			Promise.resolve({
				...taskObj,
				_id: taskId
			}));

		//Act
		await deleteTaskController(req, res, next);

		//Assert
		expect(deleteTaskService)
			.toBeCalledWith({
				taskId: req.params.taskId,
				TaskModel
			});

	});

	it("Should respond with 200 on successful delete", async () => {
		//Arrange
		req.params.taskId = generateFakeMongooseId();
		validateDatabaseId.mockImplementationOnce(() => true);
		const taskObj = {
			title: faker.lorem.sentence(),
			userId: req.user._id,
		};

		getTaskById.mockImplementationOnce(({ taskId }) =>
			Promise.resolve({
				...taskObj,
				_id: taskId
			}));

		//Act
		await deleteTaskController(req, res, next);

		//Assert
		expect(res.statusCode).toBe(200);
	});

	it("Should pass an not found api error to next if no task with the specified id is found", async () => {
		//Arrange
		const notFoundError = new ApiError(
			NOT_FOUND_ERROR,
			"The task was not found",
			404
		);

		getTaskById.mockImplementationOnce(() =>
			Promise.resolve(null));

		//Act
		await deleteTaskController(req, res, next);

		//Assert
		expect(next)
			.toBeCalledWith(notFoundError);
	});

	it("Should pass an unauthenticated api error if user is not authenticated", async () => {
		//Arrange
		req.user = undefined;

		//Act
		await deleteTaskController(req, res, next);

		//Assert
		expect(next).toBeCalled();
		const err = next.mock.calls[0][0];
		expect(err).toBeInstanceOf(ApiError);
		expect(err.errorCode).toBe(UNAUTHENTICATED_ERROR);
		expect(err.httpStatusCode).toBe(401);
	});

	it("Should pass an unauthorized api error to next if the user does not own the task to be deleted", async () => {
		//Arrange 
		req.user = { _id: generateFakeMongooseId() };
		req.params = { taskId: generateFakeMongooseId() };
		const taskObj = { title: faker.lorem.sentence() };

		while (taskObj.userId === req.user._id)
			taskObj.userId = generateFakeMongooseId();

		getTaskById.mockImplementationOnce(({ taskId }) =>
			Promise.resolve({ ...taskObj, _id: taskId }));

		//Act
		await deleteTaskController(req, res, next);

		//Assert
		expect(next).toBeCalledTimes(1);
		const err = next.mock.calls[0][0];
		expect(err).toBeInstanceOf(ApiError);
		expect(err.errorCode).toBe(UNAUTHORIZED);
		expect(err.httpStatusCode).toBe(403);
	});

	it("Should pass an invalid id api error if the passed task id is not valid database id", async () => {
		//Arrange
		validateDatabaseId.mockImplementationOnce(() => false);

		//Act
		await deleteTaskController(req, res, next);

		//Assert
		expect(next).toBeCalledWith(new ApiError(
			INVALID_ID,
			"Task id is not valid",
			400
		));

	});
});