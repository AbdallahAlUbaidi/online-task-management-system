import express from "express";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

import UserModel from "../api/v1/models/User.js";

import {
	createUser,
	getUserByName,
	getUserByEmail
} from "../api/v1/services/user.js";

import {
	validateUsername,
	validateEmail,
	validatePassword
} from "../api/v1/validators/user.js";

import {
	hashPassword
} from "../helpers/passwordUtils.js";

import {
	initializePostRegisterController,
	initializePostLoginController
} from "../api/v1/controllers/auth.js";

import authRouterInitializer from "../api/v1/routes/auth.js";

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

});

app.use("/api/v1/auth", authRouterInitializer({
	postRegisterController,
	postLoginController
}));

export default app;