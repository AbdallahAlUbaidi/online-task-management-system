import ApiError from "../../ApiError.js";
import {
	INVALID_INPUT, UNAUTHENTICATED_ERROR
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