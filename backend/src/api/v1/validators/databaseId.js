import mongoose from "mongoose";

export const validateDatabaseId = id =>
	mongoose.isValidObjectId(id);