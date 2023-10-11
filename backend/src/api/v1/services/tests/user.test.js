import { vi, describe, it, beforeEach, expect } from "vitest";

import {
	createUser
} from "../user.js";

describe("createUser service", () => {
	let User = {};
	let mockData;
	beforeEach(() => {
		User.create = vi.fn(
			userData => new Promise((resolve, reject) => {
				setTimeout(() => {
					if (/existing/gi.test(userData.username))
						reject(new Error("user already exists"));
					if (/existing/gi.test(userData.email))
						reject(new Error("email already exists"));
					resolve({
						_id: String(Math.floor(Math.random() * 1000)),
						...userData
					});
				}, 100);
			})
		);

		mockData = [
			{ username: "username1", email: "email1", password: "password1" },
			{ username: "username2", email: "email2", password: "password2" },
			{ username: "username3", email: "email3", password: "password3" },
		];
	});


	it("should call User.create() with username , email and password", async () => {

		for (let userData of mockData) {

			User.create.mockClear();
			await createUser({
				...userData,
				UserModel: User
			});


			expect(User.create).toBeCalledTimes(1);
			expect(User.create.mock.results[0].value).not.toBeInstanceOf(Promise);
			expect(User.create.mock.calls[0][0].username).toBe(userData.username);
			expect(User.create.mock.calls[0][0].email).toBe(userData.email);
			expect(User.create.mock.calls[0][0].password).toBe(userData.password);
		}
	}, 1000);

	it("should return a user object containing _id . username , email and password", async () => {
		for (let userData of mockData) {

			User.create.mockClear();
			const newUser = await createUser({
				...userData,
				UserModel: User
			});

			expect(newUser).toBeDefined();
			expect(typeof newUser).toBe("object");
			expect(User.create.mock.results[0].value).deep.toEqual(newUser);
		}
	}, 1000);
});