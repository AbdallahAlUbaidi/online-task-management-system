import ApiError from "../../ApiError.js";
import {
	INVALID_CREDENTIALS,
	VALIDATION_ERROR,
} from "../../../constants/apiErrorCodes.js";

export const initializePostRegisterController = ({
	createUser,
	getUserByName,
	getUserByEmail,
	UserModel,
	hashPassword,
	validateUsername,
	validateEmail,
	validatePassword
}) =>
	async (req, res, next) => {
		try {
			const {
				username,
				email,
				password
			} = req.body;

			if (!validateUsername(username))
				throw new ApiError(VALIDATION_ERROR, "Invalid username", 400);

			if (await getUserByName({ username, UserModel }))
				throw new ApiError(VALIDATION_ERROR, "Username already exists", 400);

			if (!validateEmail(email))
				throw new ApiError(VALIDATION_ERROR, "invalid email", 400);

			if (await getUserByEmail({ email, UserModel }))
				throw new ApiError(VALIDATION_ERROR, "email already exists", 400);

			if (!validatePassword(password))
				throw new ApiError(VALIDATION_ERROR, "Password not strong enough", 400);

			const hashedPass = await hashPassword(password);

			await createUser({
				username,
				email,
				password: hashedPass,
				UserModel
			});
			res.sendStatus(201);
		} catch (err) {
			next(err);
		}
	};

export const initializePostLoginController = ({
	getUserByName,
	comparePasswords,
	issueToken,
	UserModel
}) => async (req, res, next) => {
	const { username, password } = req.body;
	try {
		const user = await getUserByName({ username, UserModel });
		if (!user)
			throw new ApiError(INVALID_CREDENTIALS, "Invalid credentials", 400);
		if (!await comparePasswords(password, user.password))
			throw new ApiError(INVALID_CREDENTIALS, "Invalid credentials", 400);
		const token = await issueToken(user.id);
		res.status(200).json({ token });

	} catch (err) {
		next(err);
	}

};

export default {
	initializePostRegisterController,
	initializePostLoginController
};