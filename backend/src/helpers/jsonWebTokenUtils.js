import jwt from "jsonwebtoken";

export const issueToken = async userId => jwt.sign({ sub: userId }, process.env.AUTH_KEY, {
	algorithm: "HS256",
	expiresIn: "7d"
});

export const verifyToken = token => new Promise((resolve, reject) => {
	jwt.verify(token, process.env.AUTH_KEY, (error, payload) => {
		if (error) {
			if (error.name === "JsonWebTokenError")
				return resolve(false);
			reject(error);
		}
		resolve(payload);
	});
});


export default {
	issueToken,
	verifyToken
};