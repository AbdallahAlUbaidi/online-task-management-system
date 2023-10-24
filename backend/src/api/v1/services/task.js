import ApiError from "../../ApiError.js";
import {
	INVALID_ID,
	INVALID_INPUT,
	NOT_FOUND_ERROR,
	UNAUTHENTICATED_ERROR
} from "../../../constants/apiErrorCodes.js";

export const getTasksByUserId = async ({
	userId,
	TaskModel
}) => {
	if (!userId)
		throw new ApiError(UNAUTHENTICATED_ERROR, "User id is undefined", 401);

	return TaskModel.find({
		userId
	});
};

export const getTaskById = async ({
	TaskModel,
	taskId
}) => {

	if (!taskId)
		throw new ApiError(
			INVALID_INPUT,
			"Task id is invalid or unspecified",
			400
		);

	return TaskModel.findOne({ _id: taskId });
};

export const createTask = async ({
	title,
	dueDate,
	userId,
	TaskModel,
}) => {
	return await TaskModel.create({
		title,
		dueDate,
		userId
	});
};

export const deleteTask = async ({
	TaskModel,
	taskId
}) => {
	const result = await TaskModel.deleteOne({ _id: taskId });
	if (result.n <= 0)
		throw new ApiError(
			NOT_FOUND_ERROR,
			"The task you are trying to delete does not exists",
			404
		);
};

export const updateTaskTitle = async ({
	TaskModel,
	taskId,
	title,
	validateDatabaseId
}) => {

	if (!validateDatabaseId(taskId))
		throw new ApiError(
			INVALID_ID,
			"No task id specified",
			400
		);

	if (!title)
		throw new ApiError(
			INVALID_INPUT,
			"No valid title was passed",
			400
		);

	return await TaskModel.findByIdAndUpdate(taskId, { title }, { new: true });
};

export const updateTaskStatus = async ({
	TaskModel,
	taskId,
	completed,
	validateDatabaseId
}) => {

	if (completed === undefined || completed === null)
		throw new ApiError(
			INVALID_INPUT,
			"Task status is not specified",
			400
		);

	if (!validateDatabaseId(taskId))
		throw new ApiError(
			INVALID_ID,
			"The passed task id is invalid",
			400
		);


	return await TaskModel.findByIdAndUpdate(taskId, { completed }, { new: true });
};