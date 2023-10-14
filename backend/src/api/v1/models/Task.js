import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
	description: {
		type: mongoose.SchemaTypes.String,
		required: true,
		minLength: 10,
		maxLength: 256,
	},

	completed: {
		type: mongoose.SchemaTypes.Boolean,
		default: false
	},

	user_id: {
		type: mongoose.SchemaTypes.ObjectId,
		ref: "User"
	}
});

export default mongoose.model("Task", taskSchema);