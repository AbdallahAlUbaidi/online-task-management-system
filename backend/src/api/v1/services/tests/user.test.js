import { vi, describe, it, beforeEach, expect } from "vitest";

import {
	createUser,
	getUserByName,
	getUserByEmail
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


describe("getUserByName service", () => {
	let User = {};
	beforeEach(() => {
		User.findOne = vi.fn(({ username }) =>
			new Promise(resolve => {
				setTimeout(() => {
					if (!/existing/gi.test(username))
						resolve(null);
					else resolve({
						_id: String(Math.floor(Math.random() * 100000)),
						username,
						email: "email",
						password: "$hash$"
					});
				}, 100);
			}));
	});

	it("should call User.findOne() with an object containing passed username", async () => {
		let mockData = [
			{ username: "username1" },
			{ username: "username2" },
			{ username: "username3" },
		];

		for (let data of mockData) {
			User.findOne.mockClear();
			await getUserByName({
				...data,
				UserModel: User
			});

			expect(User.findOne).toBeCalledTimes(1);
			expect(typeof User.findOne.mock.calls[0][0]).toBe("object");
			expect(User.findOne.mock.results[0].value).not.toBeInstanceOf(Promise);
			expect(User.findOne.mock.calls[0][0].username).toBe(data.username);
		}
	});

	it("should return a user object if a user exists", async () => {
		let mockData = [
			{ username: "existing username1" },
			{ username: "existing username2" },
			{ username: "existing username3" },
		];

		for (let data of mockData) {
			User.findOne.mockClear();
			const user = await getUserByName({
				...data,
				UserModel: User
			});

			expect(User.findOne.mock.results[0].value).not.toBeInstanceOf(Promise);
			expect(user._id).toBeDefined();
			expect(user.email).toBeDefined();
			expect(user.password).toBeDefined();
			expect(user.username).toBe(data.username);
		}
	}, 1000);

	it("should return null if no username is passed", async () => {
		const user = await getUserByName({ UserModel: User });
		expect(user).toBeNull();
	}, 1000);

	it("should return null if not matching user is found", async () => {
		let mockData = [
			{ username: "username1" },
			{ username: "username2" },
			{ username: "username3" },
		];

		for (let data of mockData) {
			User.findOne.mockClear();
			const user = await getUserByName({
				...data,
				UserModel: User
			});

			expect(User.findOne.mock.results[0].value).not.toBeInstanceOf(Promise);
			expect(user).toBeNull();
		}
	});
});

describe("getUserByEmail service", () => {
	let User = {};
	beforeEach(() => {
		User.findOne = vi.fn(({ email }) =>
			new Promise(resolve => {
				setTimeout(() => {
					if (!/existing/gi.test(email))
						resolve(null);
					else resolve({
						_id: String(Math.floor(Math.random() * 100000)),
						email,
						username: "username",
						password: "$hash$"
					});
				}, 100);
			}));
	});

	it("should call User.findOne() with an object containing passed email", async () => {
		let mockData = [
			{ email: "email1" },
			{ email: "email2" },
			{ email: "email3" },
		];

		for (let data of mockData) {
			User.findOne.mockClear();
			await getUserByEmail({
				...data,
				UserModel: User
			});

			expect(User.findOne).toBeCalledTimes(1);
			expect(typeof User.findOne.mock.calls[0][0]).toBe("object");
			expect(User.findOne.mock.results[0].value).not.toBeInstanceOf(Promise);
			expect(User.findOne.mock.calls[0][0].email).toBe(data.email);
		}
	});

	it("should return a user object if a user exists", async () => {
		let mockData = [
			{ email: "existing email1" },
			{ email: "existing email2" },
			{ email: "existing email3" },
		];

		for (let data of mockData) {
			User.findOne.mockClear();
			const user = await getUserByEmail({
				...data,
				UserModel: User
			});

			expect(User.findOne.mock.results[0].value).not.toBeInstanceOf(Promise);
			expect(user._id).toBeDefined();
			expect(user.username).toBeDefined();
			expect(user.password).toBeDefined();
			expect(user.email).toBe(data.email);
		}
	}, 1000);

	it("should return null if no email is passed", async () => {
		const user = await getUserByEmail({ UserModel: User });
		expect(user).toBeNull();
	}, 1000);

	it("should return null if not matching user is found", async () => {
		let mockData = [
			{ email: "email1" },
			{ email: "email2" },
			{ email: "email3" },
		];

		for (let data of mockData) {
			User.findOne.mockClear();
			const user = await getUserByEmail({
				...data,
				UserModel: User
			});

			expect(User.findOne.mock.results[0].value).not.toBeInstanceOf(Promise);
			expect(user).toBeNull();
		}
	});
});