
export const initializePostRegisterController = ({
	createUser,
	getUserByName,
	getUserByEmail,
	hashPassword,
	validateUsername,
	validateEmail,
	validatePassword
}) =>
	async (req, res) => {
		try {
			const {
				username,
				email,
				password
			} = req.body;

			if (!validateUsername(username))
				return res.status(400).json({
					message: "invalid username"
				});

			if (await getUserByName(username))
				return res.status(400).json({
					message: "username already exists"
				});


			if (!validateEmail(email))
				return res.status(400).json({
					message: "invalid email"
				});

			if (await getUserByEmail(email))
				return res.status(400).json({
					message: "email already exists"
				});

			if (!validatePassword(password))
				return res.status(400).json({
					message: "password is not strong enough"
				});

			const hashedPass = await hashPassword(password);

			await createUser({
				username,
				email,
				password: hashedPass
			});
			res.sendStatus(201);
		} catch (err) {
			res.status(500).json({
				message: "Internal server error",
				error: err.message
			});
		}
	};

export default {
	initializePostRegisterController,
};