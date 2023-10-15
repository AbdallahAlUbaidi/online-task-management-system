import { vi, describe, it, expect, beforeEach } from "vitest";
import { faker } from "@faker-js/faker";

import generateFakeMongooseId from "../../../../helpers/generateFakeMongooseId.js";

import {
	initializeGetTasksController
} from "../task.js";

import {
	UNAUTHENTICATED_ERROR
} from "../../../../constants/apiErrorCodes.js";


import {
	Request,
	Response
} from "../../../../mocks/express.js";

describe("Get tasks controller", () => {
	let TaskModel, getTasksByUserId, getTasksController,
		fakeTask,
		req, res, next;

	beforeEach(() => {
		req = new Request();
		res = new Response();

		next = vi.fn();

		TaskModel = {};

		fakeTask = {
			_id: generateFakeMongooseId(),
			title: faker.lorem.sentence(),
			completed: false
		};

		getTasksByUserId = vi.fn(() =>
			Promise.resolve([
				fakeTask
			]));

		getTasksController = initializeGetTasksController({
			TaskModel,
			getTasksByUserId
		});
	});

	it("Should respond with status 200 and array of task objects", async () => {
		//Arrange
		req.user = {
			_id: generateFakeMongooseId(),
			username: faker.person.firstName(),
			email: faker.internet.email(),
			password: faker.internet.password()
		};
		fakeTask.userId = req.user._id;

		//Act
		await getTasksController(req, res, next);

		//Assert
		expect(res.statusCode).toBe(200);
		expect(res.body).toStrictEqual([fakeTask]);

	});

	it("Should pass an api unauthenticated error when user is not authenticated", async () => {
		//Arrange
		req.user = undefined;

		//Act
		await getTasksController(req, res, next);

		//Assert
		expect(next).toBeCalledTimes(1);
		expect(next.mock.calls[0][0].errorCode)
			.toBe(UNAUTHENTICATED_ERROR);
	});

});