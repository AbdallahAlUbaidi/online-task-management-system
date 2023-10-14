import { vi, describe, expect, it, beforeEach } from "vitest";
import { faker } from "@faker-js/faker";

import generateFakeMongooseId from "../../../../helpers/generateFakeMongooseId.js";

import {
	createTask
} from "../task.js";

describe("Create task service", () => {
	let TaskModel = {};

	beforeEach(() => {
		TaskModel.create = vi.fn();
	});

	it("should create a task and save it to the database when given task description", async () => {
		//Arrange
		TaskModel.create.mockImplementationOnce(() =>
			Promise.resolve({
				_id: generateFakeMongooseId(),
			}));

		//Act
		await createTask({
			description: faker.lorem.lines(1),
			userId: generateFakeMongooseId(),
			TaskModel
		});

		//Assert
		expect(TaskModel.create).toBeCalledTimes(1);

	});

	it("should return the created task object", async () => {
		//Arrange
		TaskModel.create.mockImplementationOnce(({
			userId,
			description
		}) =>
			Promise.resolve({
				_id: generateFakeMongooseId(),
				userId,
				description
			}));

		//Act
		const task = await createTask({
			description: faker.lorem.lines(1),
			userId: generateFakeMongooseId(),
			TaskModel
		});

		//Assert
		expect(task).toStrictEqual(
			TaskModel.create.mock.results[0].value
		);
	});
});