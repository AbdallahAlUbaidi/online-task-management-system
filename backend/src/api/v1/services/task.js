import ApiError from "../../ApiError.js";
import {
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