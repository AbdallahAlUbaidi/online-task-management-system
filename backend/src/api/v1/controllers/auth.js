import ApiError from "../../ApiError.js";
import {
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

}) => (req, res, next) => {

};

export default {
	initializePostRegisterController,
	initializePostLoginController
};