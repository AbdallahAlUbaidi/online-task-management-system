import mongoose from "mongoose";

export default async ({
	dbHost,
	dbName,
	username,
	password
}) => {
	const connectionString = username ?
		`mongodb://${username}:${password}@${dbHost}:27017/${dbName}`
		: `mongodb://${dbHost}:27017/${dbName}`;
	return mongoose.connect(connectionString);
};