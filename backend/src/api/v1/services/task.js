import ApiError from "../../ApiError.js";
import {
	INVALID_INPUT,
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