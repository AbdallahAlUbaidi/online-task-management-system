import { expect, it, describe, vi } from "vitest";

import initializeAuthRouter from "../auth.js";

const postLoginController = vi.fn((req, res) => res.sendStatus(200));
const postRegisterController = vi.fn((req, res) => res.sendStatus(200));

const router = initializeAuthRouter({
	postLoginController,
	postRegisterController
});


describe("Auth router initializer function", () => {
	it("Should return a router", () => {
		expect(router.__proto__.use).toBeDefined();
		expect(router.__proto__.get).toBeDefined();
		expect(router.__proto__.post).toBeDefined();
		expect(router.__proto__.put).toBeDefined();
		expect(router.__proto__.delete).toBeDefined();
	});

	it("The returned router should have post on '/register' route", () => {
		const registerRoute = router
			.stack
			.find(l => l.route.path === "/register");

		expect(registerRoute).toBeDefined();
		expect(registerRoute.route.methods["post"]).toBe(true);
	});

	it("The returned router should have post on '/login' route", () => {
		const loginRoute = router
			.stack
			.find(l => l.route.path === "/login");

		expect(loginRoute).toBeDefined();
		expect(loginRoute.route.methods["post"]).toBe(true);
	});

});

import express from "express";
import supertest from "supertest";

const mockApp = express();

mockApp.use(express.json());
mockApp.use("/", router);


const request = supertest(mockApp);

describe("Register route", () => {
	it("Should call postRegisterController when a request is made to '/register' once per request", async () => {
		postRegisterController.mockClear();
		await request.post("/register");
		expect(postRegisterController).toBeCalled();
		expect(postRegisterController.mock.calls.length).toBe(1);
	}, 1000);

	it("should not call postRegisterController when a request is made to other url", async () => {
		postRegisterController.mockClear();
		await request.post("/a");
		expect(postRegisterController).not.toBeCalled();
	}, 1000);
});

describe("login route", () => {
	it("Should call postLoginController when a request is made to '/login' once per request", async () => {
		postLoginController.mockClear();
		await request.post("/login");
		expect(postLoginController).toBeCalled();
		expect(postLoginController.mock.calls.length).toBe(1);
	}, 1000);

	it("should not call postLoginController when a request is made to other url", async () => {
		postLoginController.mockClear();
		await request.post("/a");
		expect(postLoginController).not.toBeCalled();
	}, 1000);
});