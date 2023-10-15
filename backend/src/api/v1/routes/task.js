import express from "express";

const router = express.Router();

export default ({ createTaskController }) => {

	router.post("/task", createTaskController);

	return router;
};