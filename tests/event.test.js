import { describe, it, expect } from "vitest";
import request from "supertest";

import { app } from "../src/app.js";

describe("POST /event", () => {
  it("should create account with initial balance", async () => {
    const response = await request(app).post("/event").send({
      type: "deposit",
      destination: "100",
      amount: 10,
    });

    expect(response.status).toBe(201);
    expect(response.body).toStrictEqual({
      destination: { id: "100", balance: 10 },
    });
  });

  it("should deposit amount into existing account", async () => {
    await request(app).post("/reset");

    await request(app).post("/event").send({
      type: "deposit",
      destination: "100",
      amount: 10,
    });

    const response = await request(app).post("/event").send({
      type: "deposit",
      destination: "100",
      amount: 10,
    });

    expect(response.status).toBe(201);
    expect(response.body).toStrictEqual({
      destination: { id: "100", balance: 20 },
    });
  });
});
