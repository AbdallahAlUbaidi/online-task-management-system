import { vi, beforeEach, describe, it, expect } from "vitest";
import { faker } from "@faker-js/faker";
import generateFakeMongooseId from "../../../../helpers/generateFakeMongooseId.js";

import {
	INVALID_INPUT
} from "../../../../constants/apiErrorCodes.js";

import {
	Request,
	Response
} from "../../../../mocks/express.js";

import { initializeCreateTaskController } from "../task.js";

describe("Create task controller", () => {
	let req, res, next, createTaskController, createTask;

	beforeEach(() => {
		req = new Request();

		req.user = {
			_id: generateFakeMongooseId(),
			username: faker.person.firstName(),
			email: faker.internet.email()
		};

		res = new Response();
		next = vi.fn();

		createTask = vi.fn(obj => Promise.resolve({
			_id: generateFakeMongooseId(),
			userId: req.user._id,
			...obj
		}));


		createTaskController = initializeCreateTaskController({
			createTask,
			TaskModel: {}
		});

	});

	it("Should create new task and save it to the database given task title and due date", async () => {
		//Arrange
		req.body = {
			title: faker.lorem.lines(1),
			dueDate: faker.date.between({
				from: Date.now(),
				to: Date.now() + 1000 * 60 * 60 * 24 * 30
			})
		};

		//Act
		await createTaskController(req, res, next);

		//Assert
		expect(createTask).toBeCalledTimes(1);
	});

	it("Should respond with 201 and the newly created task object", async () => {
		//Arrange
		req.body = {
			title: faker.lorem.lines(1),
			dueDate: faker.date.between({
				from: Date.now(),
				to: Date.now() + 1000 * 60 * 60 * 24 * 30
			})
		};

		//Act
		await createTaskController(req, res, next);

		//Assert
		expect(res.statusCode).toBe(201);
		expect(res.body._id).toBeDefined();

	});

	it("Should pass an api invalid input error to the next callback when title is missing", async () => {
		//Arrange
		req.body = {
			dueDate: faker.date.between({
				from: Date.now(),
				to: Date.now() + 1000 * 60 * 60 * 24 * 30
			})
		};

		//Act
		await createTaskController(req, res, next);

		//Assert
		expect(next).toHaveBeenCalledOnce();
		expect(next.mock.calls[0][0].errorCode).toBe(INVALID_INPUT);


	});

});