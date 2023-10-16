import express from "express";

const router = express.Router();

export default ({
	createTaskController,
	getTasksController,
	getTaskController
}) => {

	router.get("/", getTasksController);

	router.get("/:taskId", getTaskController);

	router.post("/", createTaskController);

	return router;
};