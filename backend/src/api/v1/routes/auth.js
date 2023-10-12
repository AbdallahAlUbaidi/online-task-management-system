import express from "express";

const router = express.Router();

export default ({
	postRegisterController,
	postLoginController
}) => {
	router.post("/register", postRegisterController);
	router.post("/login", postLoginController);
	return router;
};  