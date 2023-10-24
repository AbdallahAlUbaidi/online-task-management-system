import ApiError from "../../ApiError.js";
import {
	INVALID_ID,
	INVALID_INPUT,
	NOT_FOUND_ERROR,
	UNAUTHENTICATED_ERROR,
	UNAUTHORIZED
} from "../../../constants/apiErrorCodes.js";

export const initializeCreateTaskController = ({
	createTask,
	TaskModel
}) => async (req, res, next) => {

	const { title, dueDate } = req.body;
	const userId = req.user._id;


	try {
		if (!title)
			throw new ApiError(
				INVALID_INPUT,
				"Task title was not specified",
				400
			);

		const task = await createTask({
			title,
			dueDate,
			userId,
			TaskModel
		});

		res.status(201).json(task);

	} catch (err) {
		next(err);
	}
};

export const initializeGetTasksController = ({
	TaskModel,
	getTasksByUserId
}) => async (req, res, next) => {

	try {

		if (!req.user)
			throw new ApiError(
				UNAUTHENTICATED_ERROR,
				"User is not authenticated",
				401
			);

		const userId = req.user._id;

		const tasks = await getTasksByUserId({
			userId,
			TaskModel
		});

		res.status(200).json(tasks);

	} catch (err) {
		next(err);
	}
};

export const initializeGetTaskController = ({
	getTaskById,
	TaskModel,
	validateDatabaseId
}) => async (req, res, next) => {

	const { taskId } = req.params;

	try {

		if (!validateDatabaseId(taskId))
			throw new ApiError(
				INVALID_ID,
				"No task id is passed as a url parameter",
				400
			);

		const task = await getTaskById({
			TaskModel,
			taskId
		});

		if (!task)
			return res.sendStatus(404);

		if (String(task.userId) !== String(req.user._id))
			throw new ApiError(
				UNAUTHORIZED,
				"You are unauthorized to access this resource",
				403
			);

		res.status(200).json(task);
	} catch (err) {
		next(err);
	}

};

export const initializeDeleteTaskController = ({
	deleteTaskService,
	validateDatabaseId,
	getTaskById,
	TaskModel
}) => async (req, res, next) => {

	const { taskId } = req.params;

	try {

		if (!validateDatabaseId(taskId))
			throw new ApiError(
				INVALID_ID,
				"Task id is not valid",
				400);

		if (!req.user)
			throw new ApiError(
				UNAUTHENTICATED_ERROR,
				"you are not authenticated",
				401
			);

		const task = await getTaskById({ TaskModel, taskId });

		if (!task)
			throw new ApiError(
				NOT_FOUND_ERROR,
				"The task was not found",
				404
			);

		if (String(task.userId) !== String(req.user._id))
			throw new ApiError(
				UNAUTHORIZED,
				"You are not authorized to access this resource",
				403
			);

		await deleteTaskService({
			TaskModel,
			taskId
		});

		res.sendStatus(200);

	} catch (err) {
		next(err);
	}
};

export const initializeUpdateTaskController = ({
	TaskModel,
	getTaskById,
	updateTaskStatus,
	updateTaskTitle,
	validateDatabaseId
}) => async (req, res, next) => {
	try {

		if (!req.body.title &&
			(req.body.completed === undefined ||
				req.body.completed === null))
			throw (new ApiError(
				INVALID_INPUT,
				"Information of updated task is missing",
				400
			));

		const { title, completed } = req.body;
		const { taskId } = req.params;

		const task = await getTaskById({
			taskId,
			TaskModel
		});

		if (String(task.userId) !== String(req.user._id))
			throw (new ApiError(
				UNAUTHORIZED,
				"You are unauthorized to access this resource",
				403
			));

		let newTask;

		if (title)
			newTask = await updateTaskTitle({
				taskId,
				title,
				TaskModel,
				validateDatabaseId
			});

		if (completed !== undefined && completed !== null)
			newTask = await updateTaskStatus({
				taskId,
				completed,
				TaskModel,
				validateDatabaseId
			});

		res.status(200).json(newTask);
	} catch (err) {
		next(err);
	}
};