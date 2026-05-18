import { describe, it, expect } from "vitest";
import request from "supertest";

import { app } from "../src/app.js";

describe("GET /balance", () => {
  it("should return balance from existing account", async () => {
    await request(app).post("/event").send({
      type: "deposit",
      destination: "100",
      amount: 10,
    });
    const response = await request(app)
      .get("/balance")
      .query({ account_id: 100 });

    expect(response.status).toBe(200);
    expect(response.body).toBe(10);
  });
});

describe("GET /balance", () => {
  it("should return error from non existing account", async () => {
    const response = await request(app)
      .get("/balance")
      .query({ account_id: 1234 });

    expect(response.status).toBe(404);
    expect(response.body).toBe(0);
  });
});
