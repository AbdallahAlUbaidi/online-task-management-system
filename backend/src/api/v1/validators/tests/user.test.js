import { describe, it, expect } from "vitest";

import {
	validateUsername,
	validateEmail,
	validatePassword
} from "../user.js";

describe("Username validator", () => {
	it("returns false if empty string or falsy value is passed", () => {
		expect(validateUsername()).toBe(false);
		expect(validateUsername(undefined)).toBe(false);
		expect(validateUsername(null)).toBe(false);
		expect(validateUsername("")).toBe(false);
	});

	it("returns false if username  less than 6 characters password", () =>
		expect(validateUsername("users")).toBe(false));

	it("returns false if username  more than 30 characters", () =>
		expect(validateUsername(
			"usersusersusersusersusersusersusers"
		)).toBe(false));

	it("returns false if username starts with non alphabetic character", () =>
		expect(validateUsername("0users")).toBe(false));

	it("returns false if username contains special character except _", () =>
		expect(validateUsername("user-name")).toBe(false));

	it("returns false if username contains space in the middle of string", () =>
		expect(validateUsername("user name")).toBe(false));

	it("returns false if username contains at the beginning", () =>
		expect(validateUsername(" username")).toBe(false));

	it("returns false if username contains at the end", () =>
		expect(validateUsername("username ")).toBe(false));

	it("returns true if username have only alphabetic characters", () =>
		expect(validateUsername("username")).toBe(true));

	it("returns true if username have both alphabetic and numeric characters", () =>
		expect(validateUsername("username000")).toBe(true));

	it("returns true if username have both alphabetic and an underscore", () =>
		expect(validateUsername("user_name")).toBe(true));

	it("returns true if username have numeric, underscore and alphabetic characters", () =>
		expect(validateUsername("user_name000")).toBe(true));

	it("returns true if username is exactly 6 characters long", () =>
		expect(validateUsername("abcdef")).toBe(true));

	it("returns true if username is exactly 30 characters long", () =>
		expect(validateUsername("usersusersusersusersusersusers")).toBe(true));
});


describe("Email validator", () => {
	it("returns false if empty string or falsy value is passed", () => {
		expect(validateEmail(undefined)).toBe(false);
		expect(validateEmail(null)).toBe(false);
		expect(validateEmail("")).toBe(false);
		expect(validateEmail()).toBe(false);

	});

	it("returns false if not \"@\" is included in the email", () =>
		expect(validateEmail("exampleemail.com")).toBe(false));

	it("returns false if not at least 1 dot is include in the email", () =>
		expect(validateEmail("example@emailcom")).toBe(false));

	it("returns false if more than one @ is included in the email", () =>
		expect(validateEmail("example@email@gmail.com")).toBe(false));

	it("returns false if email contains special characters except \".\" and \"_\" and -", () => {
		expect(validateEmail("example;email@email.com")).toBe(false);
		expect(validateEmail("example/email@email.com")).toBe(false);
	});

	it("returns false if email hostname has special characters", () =>
		expect(validateEmail("example@email_email.com")).toBe(false));

	it("returns false if email domain has special characters", () =>
		expect(validateEmail("example@email.c_m")).toBe(false));

	it("returns false if email starts with non alphanumeric character", () =>
		expect(validateEmail("_example@email.com")).toBe(false));


	it("returns false if email contains space", () => {
		expect(validateEmail("example@em ail.com")).toBe(false);
		expect(validateEmail("exampl e@email.com")).toBe(false);
		expect(validateEmail(" example@em ail.com")).toBe(false);
		expect(validateEmail("example@em ail.com ")).toBe(false);
	});

	it("returns false if domain is shorter than 2 characters", () =>
		expect(validateEmail("example@email.a")).toBe(false));

	it("returns false if domain is longer than 4 characters", () =>
		expect(validateEmail("example@email.abcde")).toBe(false));

	it("returns true for emails with *****@*****.*** format", () => {
		expect(validateEmail("example@email.com")).toBe(true);
		expect(validateEmail("example_example@email.com")).toBe(true);
		expect(validateEmail("example.example@email.com")).toBe(true);
	});

	it("returns true for emails with numbers", () => {
		expect(validateEmail("example141@email.com")).toBe(true);
		expect(validateEmail("example_example241@email.com")).toBe(true);
		expect(validateEmail("example.example2023@email.com")).toBe(true);
	});

	it("returns true for emails with chained domains", () => {
		expect(validateEmail("ex.019.091@student.uotechnology.edu.iq")).toBe(true);
		expect(validateEmail("ex.023.011@teacher.uotechnology.edu.eg")).toBe(true);
	});

	it("returns true for emails with all numbers before @", () => {
		expect(validateEmail("12512356@email.edu.iq")).toBe(true);
		expect(validateEmail("121231@email.com")).toBe(true);
	});

});


describe("Password validator", () => {
	it("returns false if empty string or falsy value  is passed", () => {
		expect(validatePassword()).toBe(false);
		expect(validatePassword("")).toBe(false);
		expect(validatePassword(null)).toBe(false);
		expect(validatePassword(undefined)).toBe(false);
	});

	it("returns false if password is shorter than 14 characters", () => {
		expect(validatePassword("1aA1")).toBe(false);
		expect(validatePassword("12aA567890123")).toBe(false);
	});

	it("returns false if password does not have a at least 1 number", () =>
		expect(validatePassword("abcdefghijklmnopq")).toBe(false));

	it("returns false if password does not have a at least 1 lowercase character", () =>
		expect(validatePassword("12A56789012345")).toBe(false));

	it("returns false if password does not have a at least 1 uppercase character", () =>
		expect(validatePassword("12a56789012345")).toBe(false));

	it("returns true if password contains upper and lower characters, numbers and of length 14 or more", () => {
		expect(validatePassword("123A123123a123")).toBe(true);
		expect(validatePassword("aB51cdEfghijk11lmnopq")).toBe(true);
	});

	it("returns true despite password containing special characters", () => {
		expect(validatePassword("ab51cDefg_/$k11lmnopq")).toBe(true);
		expect(validatePassword("123A12 {23a123")).toBe(true);
	});
});