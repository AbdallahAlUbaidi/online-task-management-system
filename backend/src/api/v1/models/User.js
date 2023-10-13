import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	username: {
		type: mongoose.SchemaTypes.String,
		required: true,
		unique: true,
		minLength: 6,
		maxLength: 30
	},
	email: {
		type: mongoose.SchemaTypes.String,
		required: true,
		unique: true,
	},
	password: {
		type: mongoose.SchemaTypes.String,
		required: true,
	}
});

export default mongoose.model("User", userSchema);