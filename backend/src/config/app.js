import express from "express";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

import UserModel from "../api/v1/models/User.js";
import TaskModel from "../api/v1/models/Task.js";

import {
	createUser,
	getUserByName,
	getUserByEmail,
	getUserById
} from "../api/v1/services/user.js";

import {
	createTask
} from "../api/v1/services/task.js";

import {
	validateUsername,
	validateEmail,
	validatePassword
} from "../api/v1/validators/user.js";

import {
	hashPassword,
	comparePasswords
} from "../helpers/passwordUtils.js";

import {
	issueToken,
	verifyToken
} from "../helpers/jsonWebTokenUtils.js";

import {
	initializePostRegisterController,
	initializePostLoginController
} from "../api/v1/controllers/auth.js";

import {
	initializeCreateTaskController
} from "../api/v1/controllers/task.js";

import authRouterInitializer from "../api/v1/routes/auth.js";
import taskRouterInitializer from "../api/v1/routes/task.js";


const postRegisterController = initializePostRegisterController({
	createUser,
	getUserByName,
	getUserByEmail,
	UserModel,
	hashPassword,
	validateUsername,
	validateEmail,
	validatePassword
});

const postLoginController = initializePostLoginController({
	getUserByName,
	issueToken,
	UserModel,
	comparePasswords
});

const createTaskController = initializeCreateTaskController({
	createTask,
	TaskModel
});

import errorHandler from "../middlewares/errorHandler.js";

import initializeAuthenticate from "../middlewares/authenticate.js";

app.use("/api/v1/auth", authRouterInitializer({
	postRegisterController,
	postLoginController
}));

app.use(initializeAuthenticate({
	verifyToken,
	getUserById,
	UserModel
}));

app.use("/api/v1/task", taskRouterInitializer({
	createTaskController
}));

app.use(errorHandler);

export default app;