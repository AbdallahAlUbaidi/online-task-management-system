export default ({
	getUserById,
	verifyToken,
	UserModel
}) => async (req, res, next) => {
	const authHeader = req.headers["Authorization"];

	if (!authHeader)
		return res.sendStatus(401);

	const token = authHeader.split(" ")[1];
	const payload = await verifyToken(token, process.env.AUTH_KEY);

	if (!payload)
		return res.sendStatus(401);

	const user = await getUserById({
		id: payload.sub,
		UserModel
	});

	if (!user)
		return res.sendStatus(401);

	req.user = user;

	next();

};