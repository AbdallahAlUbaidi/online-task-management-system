import express from "express";

const router = express.Router();

export default ({
	createTaskController,
	getTasksController
}) => {

	router.get("/", getTasksController);

	router.post("/", createTaskController);

	return router;
};