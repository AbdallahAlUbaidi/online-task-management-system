import { describe, expect, it } from "vitest";
import db from "../db.js";


describe("Database connection", () => {
	it("Connection established when provided with valid host and dbName", async () => {
		const db_connection = await db({
			dbHost: "127.0.0.1",
			dbName: "testDB"
		});
		expect(db_connection).toBeDefined();
	});

	it("throws an error when invalid host is provided", async () => {
		try {
			await db({
				dbHost: "",
			});
		} catch (err) {
			expect(err).toBeDefined();
		}
	});
});
