import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
	title: {
		type: mongoose.SchemaTypes.String,
		required: true,
		minLength: 10,
		maxLength: 256,
	},
	dueDate: {
		type: mongoose.SchemaTypes.Date,
	},

	completed: {
		type: mongoose.SchemaTypes.Boolean,
		default: false
	},

	userId: {
		type: mongoose.SchemaTypes.ObjectId,
		ref: "User"
	}
});

export default mongoose.model("Task", taskSchema);