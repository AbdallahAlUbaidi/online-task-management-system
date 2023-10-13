import jwt from "jsonwebtoken";

export const issueToken = async userId => jwt.sign({ sub: userId }, process.env.AUTH_KEY, {
	algorithm: "HS256",
	expiresIn: "7d"
});

export const verifyToken = async token => jwt.verify(token, process.env.AUTH_KEY);


export default {
	issueToken,
	verifyToken
};