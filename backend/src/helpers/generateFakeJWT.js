import generateFakeMongooseId from "./generateFakeMongooseId.js";
import jwt from "jsonwebtoken";

export default async () => {
	const payload = {
		sub: generateFakeMongooseId()
	};

	return jwt.sign(payload, "secret");

};