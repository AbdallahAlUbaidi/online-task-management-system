if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}

import app from "./config/app.js";
import db from "./config/db.js";

const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Server is listening on port: ${PORT}`));
db({
	dbHost,
	dbName
})
	.then(() => console.log(`Connected to database ${dbName}@${dbHost}`))
	.catch(console.log);