export const createUser = async ({
	username,
	email,
	password,
	UserModel
}) => {
	return await UserModel.create({
		username,
		password,
		email
	});
};