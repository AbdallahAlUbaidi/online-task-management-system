import express from "express";

const router = express.Router();

export default ({ createTaskController }) => {

	router.post("/", createTaskController);

	return router;
};