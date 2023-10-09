import mongoose from "mongoose";

const constructConnectionString = ({
	dbHost,
	dbName,
	port,
	username,
	password,
	options
}) => {
	let connectionString = `mongodb${options && options.srv ? "+srv" : ""}://`;

	if (username && password) {
		const authCredentials = `${username}:${password}@`;
		connectionString += authCredentials;
	}

	const hostString = `${dbHost}${port ? `:${port}` : ""}`;
	connectionString += hostString;

	const dbNameString = `/${dbName}`;
	connectionString += dbNameString;

	if (options && options instanceof Object) {
		let optionsString = "?";
		optionsString += Object.entries(options)
			.map(([key, value]) => `${key}=${value}`)
			.join("&");
		connectionString += optionsString;
	}
	return connectionString;
};

export default async ({
	dbHost,
	dbName,
	port,
	username,
	password,
	options
}) => {
	const connectionString = constructConnectionString({
		dbHost,
		dbName,
		port,
		username,
		password,
		options
	});

	const connection = await mongoose.connect(connectionString);
	mongoose.connection.on("error", err => console.log(
		`${err.name}: ${err.message}`
	));

	return connection;
};