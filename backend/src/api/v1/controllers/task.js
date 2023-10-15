import ApiError from "../../ApiError.js";
import {
	INVALID_INPUT
} from "../../../constants/apiErrorCodes.js";

export const initializeCreateTaskController = (({
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
});