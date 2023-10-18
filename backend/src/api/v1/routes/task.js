import express from "express";

const router = express.Router();

export default ({
	createTaskController,
	getTasksController,
	getTaskController,
	deleteTaskController
}) => {

	router.get("/", getTasksController);

	router.get("/:taskId", getTaskController);

	router.post("/", createTaskController);

	router.delete("/:taskId", deleteTaskController);

	return router;
};