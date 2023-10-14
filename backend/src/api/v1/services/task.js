export const createTask = async ({
	description,
	userId,
	TaskModel,
}) => {
	return await TaskModel.create({
		description,
		userId
	});
};