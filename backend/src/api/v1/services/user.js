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

export const getUserByName = async ({
	username,
	UserModel
}) => {
	if (!username)
		return null;
	return await UserModel.findOne({
		username
	});
};

export const getUserByEmail = async ({
	email,
	UserModel
}) => {
	if (!email)
		return null;
	return UserModel.findOne({
		email
	});
};

export const getUserById = async ({
	id,
	UserModel
}) => {
	if (!id)
		return null;
	return await UserModel.findById(id);
};