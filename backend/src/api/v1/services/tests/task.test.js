import { vi, describe, expect, it, beforeEach } from "vitest";
import { faker } from "@faker-js/faker";

import ApiError from "../../../ApiError.js";
import {
	INVALID_ID,
	INVALID_INPUT,
	NOT_FOUND_ERROR,
	UNAUTHENTICATED_ERROR
} from "../../../../constants/apiErrorCodes.js";

import generateFakeMongooseId from "../../../../helpers/generateFakeMongooseId.js";

import {
	createTask,
	getTasksByUserId,
	getTaskById,
	deleteTask,
	updateTaskTitle,
	updateTaskStatus,
} from "../task.js";

describe("Get tasks by user id service", () => {

	let TaskModel = {};

	beforeEach(() => {
		TaskModel.find = vi.fn();
	});

	it("Should throw an api unauthenticated error when user id is undefined", async () => {
		//Arrange
		const userId = undefined;

		//Act
		try {
			await getTasksByUserId({
				userId,
				TaskModel
			});
			throw new Error("Expected getTasksByUserId to throw an error but it didn't");
		} catch (err) {

			//Assert
			expect(err).toBeInstanceOf(ApiError);
			expect(err.errorCode).toBe(UNAUTHENTICATED_ERROR);
		}


	});

	it("Should return an array of task objects when user id is passed", async () => {
		//Arrange
		const fakeUserId = generateFakeMongooseId();

		const fakeTasksArr = [{
			_id: generateFakeMongooseId(),
			description: faker.lorem.sentence(),
			userId: fakeUserId
		}];

		TaskModel.find.mockImplementationOnce(() =>
			Promise.resolve(fakeTasksArr));

		//Act
		const tasks = await getTasksByUserId({
			userId: fakeUserId,
			TaskModel
		});

		//Assert
		expect(tasks).toStrictEqual(fakeTasksArr);
	});
});

describe("Create task service", () => {
	let TaskModel = {};

	beforeEach(() => {
		TaskModel.create = vi.fn();
	});

	it("should create a task and save it to the database when given task title and a dueDate", async () => {
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

describe("Get a task by id service", () => {
	let TaskModel = {};

	beforeEach(() => {
		TaskModel.findOne = vi.fn();
	});

	it("Should return a task object given it's id", async () => {
		//Arrange
		const taskId = generateFakeMongooseId();
		const taskObj = {
			title: faker.lorem.sentence(),
			userId: generateFakeMongooseId(),
		};

		TaskModel.findOne.mockImplementationOnce(({ _id }) =>
			Promise.resolve({
				...taskObj,
				_id
			}));

		//Act
		const task = await getTaskById({
			taskId,
			TaskModel
		});

		//Assert
		expect(task).toStrictEqual({
			...taskObj,
			_id: taskId
		});
	});

	it("Should throw an api error of invalid input if taskId is undefined", async () => {
		//Arrange
		const taskId = undefined;

		try {
			//Act
			await getTaskById({
				TaskModel,
				taskId
			});

			throw ("Expect to throw an API error");

		} catch (err) {
			//Assert
			expect(err).toBeInstanceOf(ApiError);
			expect(err.errorCode).toBe(INVALID_INPUT);

		}
	});
});

describe("Delete task service", () => {
	let TaskModel = {};

	beforeEach(() => {
		TaskModel.deleteOne = vi.fn();
	});

	it("Should delete a task given it's id", async () => {
		//Arrange
		const taskId = generateFakeMongooseId();
		TaskModel.deleteOne
			.mockImplementationOnce(() =>
				Promise.resolve({ "n": 1, "ok": 1, "deletedCount": 1 }));

		//Act
		await deleteTask({
			TaskModel,
			taskId
		});

		//Assert
		expect(TaskModel.deleteOne).toBeCalledWith({ _id: taskId });
	});

	it("Should throw an api not found error if a task with the specified taskId was not found", async () => {
		//Arrange
		const taskId = generateFakeMongooseId();
		TaskModel.deleteOne.mockImplementationOnce(() =>
			Promise.resolve({
				n: 0,
				ok: 1
			}));

		try {
			//Act
			await deleteTask({
				taskId,
				TaskModel
			});
			throw ("Expected error to be thrown");
		} catch (err) {
			//Assert
			expect(err).toBeInstanceOf(ApiError);
			expect(err.errorCode).toBe(NOT_FOUND_ERROR);
			expect(err.httpStatusCode).toBe(404);

		}
	});
});

describe("Update task title service", () => {
	let TaskModel = {};
	let validateDatabaseId;

	beforeEach(() => {
		TaskModel.updateOne = vi.fn();
		validateDatabaseId = vi.fn(() => true);
	});

	it("Should update task title given a valid taskId and a title", async () => {
		//Arrange
		const title = faker.lorem.sentence();
		const taskId = generateFakeMongooseId();

		const updateResultObj = {
			acknowledged: true,
			matchedCount: 1,
			modifiedCount: 1
		};

		TaskModel.updateOne.mockImplementationOnce(() =>
			Promise.resolve(updateResultObj));

		//Act
		await updateTaskTitle({
			TaskModel,
			taskId,
			title,
			validateDatabaseId
		});

		//Assert
		expect(TaskModel.updateOne)
			.toBeCalledWith({ _id: taskId }, { title });
	});

	it("Should throw an invalid input api error if no title is passed", async () => {
		//Arrange
		const title = undefined;
		const taskId = generateFakeMongooseId();

		try {
			//Act
			await updateTaskTitle({
				TaskModel,
				taskId,
				title,
				validateDatabaseId
			});

			throw ("Expect an error to be thrown");
		} catch (err) {
			//Assert
			expect(err).toBeInstanceOf(ApiError);
			expect(err.errorCode).toBe(INVALID_INPUT);
		}
	});

	it("Should throw an invalid id api error if no task id is passed", async () => {
		//Arrange
		const taskId = undefined;
		const title = faker.lorem.sentence();
		validateDatabaseId.mockImplementationOnce(() => false);

		try {
			//Act
			await updateTaskTitle({
				TaskModel,
				title,
				taskId,
				validateDatabaseId
			});

			throw ("Expected an error to be thrown");
		} catch (err) {
			//Assert
			expect(err).toBeInstanceOf(ApiError);
			expect(err.errorCode).toBe(INVALID_ID);
		}
	});

	it("Should throw an invalid id api error if an invalid task id is passed", async () => {
		//Arrange
		const taskId = "Something invalid";
		const title = faker.lorem.sentence();

		validateDatabaseId.mockImplementationOnce(() => false);

		try {
			//Act
			await updateTaskTitle({
				TaskModel,
				title,
				taskId,
				validateDatabaseId
			});

			throw ("Expected an error to be thrown");
		} catch (err) {
			//Assert
			expect(err).toBeInstanceOf(ApiError);
			expect(err.errorCode).toBe(INVALID_ID);
		}
	});
});

describe("Update task status service", () => {
	let TaskModel = {};
	let validateDatabaseId;

	beforeEach(() => {
		TaskModel.updateOne = vi.fn();
		validateDatabaseId = vi.fn(() => true);
	});

	it("Should update task status given a valid task id and a boolean \"completed\"", async () => {
		//Arrange
		const completed = Math.random() <= .5;
		const taskId = generateFakeMongooseId();

		const updateResultObj = {
			acknowledged: true,
			matchedCount: 1,
			modifiedCount: 1
		};

		TaskModel.updateOne.mockImplementationOnce(() =>
			Promise.resolve(updateResultObj));

		//Act
		await updateTaskStatus({
			TaskModel,
			taskId,
			completed,
			validateDatabaseId
		});

		//Assert
		expect(TaskModel.updateOne)
			.toBeCalledWith({ _id: taskId }, { completed });
	});


	it("Should throw an invalid input api error if completed is undefined", async () => {
		//Arrange
		const completed = undefined;
		const taskId = generateFakeMongooseId();

		try {
			//Act
			await updateTaskStatus({
				TaskModel,
				taskId,
				completed,
				validateDatabaseId
			});

			throw ("Expect an error to be thrown");
		} catch (err) {
			//Assert
			expect(err).toBeInstanceOf(ApiError);
			expect(err.errorCode).toBe(INVALID_INPUT);
		}
	});

	it("Should throw an invalid id api error if no task id is passed", async () => {
		//Arrange
		const taskId = undefined;
		const completed = Math.random() * .5;
		validateDatabaseId.mockImplementationOnce(() => false);

		try {
			//Act
			await updateTaskStatus({
				TaskModel,
				completed,
				taskId,
				validateDatabaseId
			});

			throw ("Expected an error to be thrown");
		} catch (err) {
			//Assert
			expect(err).toBeInstanceOf(ApiError);
			expect(err.errorCode).toBe(INVALID_ID);
		}
	});

	it("Should throw an invalid id api error if an invalid task id is passed", async () => {
		//Arrange
		const taskId = "Something invalid";
		const completed = Math.random() <= .5;

		validateDatabaseId.mockImplementationOnce(() => false);

		try {
			//Act
			await updateTaskStatus({
				TaskModel,
				completed,
				taskId,
				validateDatabaseId
			});

			throw ("Expected an error to be thrown");
		} catch (err) {
			//Assert
			expect(err).toBeInstanceOf(ApiError);
			expect(err.errorCode).toBe(INVALID_ID);
		}
	});
});