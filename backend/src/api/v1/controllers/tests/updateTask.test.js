import { vi, expect, it, describe, beforeEach } from "vitest";

import { faker } from "@faker-js/faker";

import {
	Request,
	Response
} from "../../../../mocks/express.js";

import generateFakeMongooseId from "../../../../helpers/generateFakeMongooseId.js";

import {
	initializeUpdateTaskController
} from "../task.js";

import ApiError from "../../../ApiError.js";
import {
	INVALID_INPUT,
	UNAUTHORIZED
} from "../../../../constants/apiErrorCodes.js";


describe("Update task controller", () => {
	let req, res, next,
		updateTaskController, TaskModel,
		updateTaskStatus, updateTaskTitle,
		getTaskById;

	beforeEach(() => {
		req = new Request();
		res = new Response();

		req.user = {
			_id: generateFakeMongooseId()
		};

		next = vi.fn();

		updateTaskStatus = vi.fn();
		updateTaskTitle = vi.fn();
		getTaskById = vi.fn(() =>
			Promise.resolve({
				_id: generateFakeMongooseId,
				userId: req.user._id
			}));

		updateTaskController = initializeUpdateTaskController({
			TaskModel,
			updateTaskStatus,
			updateTaskTitle,
			getTaskById
		});



	});

	it("Should respond with 200 status code and updated task given taskId and title", async () => {
		//Arrange
		req.params = { taskId: generateFakeMongooseId() };
		req.body = { title: faker.lorem.sentence() };

		const updatedTask = {
			_id: req.params.taskId,
			title: req.body.title,
			userId: req.user._id
		};

		updateTaskTitle.mockImplementationOnce(() =>
			Promise.resolve(updatedTask));

		//Act
		await updateTaskController(req, res, next);

		//Assert
		expect(res.statusCode).toBe(200);
		expect(res.body).toStrictEqual(updatedTask);
	});

	it("Should respond with 200 status code and updated task given taskId and \"completed\" boolean", async () => {
		//Arrange
		req.params = { taskId: generateFakeMongooseId() };
		req.body = { completed: Math.random() >= .5, };

		const updatedTask = {
			_id: req.params.taskId,
			completed: req.body.completed,
			userId: req.user._id
		};

		updateTaskStatus.mockImplementationOnce(() =>
			Promise.resolve(updatedTask));

		//Act
		await updateTaskController(req, res, next);

		//Assert
		expect(res.statusCode).toBe(200);
		expect(res.body).toStrictEqual(updatedTask);
	});

	it("Should pass unauthorized api error if the task to be updated does not belong to the user", async () => {
		//Arrange
		req.params = { taskId: generateFakeMongooseId() };
		req.body = { title: faker.lorem.sentence() };

		let taskOwnerId;
		while (taskOwnerId === req.user._id)
			taskOwnerId = generateFakeMongooseId();

		getTaskById.mockImplementationOnce(() =>
			Promise.resolve({
				_id: req.params.taskId,
				title: faker.lorem.sentence(),
				userId: taskOwnerId
			}));

		//Act
		await updateTaskController(req, res, next);

		//Assert
		expect(next).toHaveBeenCalledOnce();
		const err = next.mock.calls[0][0];
		expect(err).toBeInstanceOf(ApiError);
		expect(err.errorCode).toBe(UNAUTHORIZED);
		expect(err.httpStatusCode).toBe(403);
	});

	it("Should pass an invalid input id if neither title or completed was passed", async () => {
		//Arrange 
		req.body = {};

		//Act
		await updateTaskController(req, res, next);

		//Assert
		expect(next).toHaveBeenCalledOnce();
		const err = next.mock.calls[0][0];
		expect(err).toBeInstanceOf(ApiError);
		expect(err.errorCode).toBe(INVALID_INPUT);
		expect(err.httpStatusCode).toBe(400);
	});
});