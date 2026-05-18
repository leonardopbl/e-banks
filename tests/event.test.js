import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";

import { app } from "../src/app.js";

beforeEach(async () => {
  await request(app).post("/reset");
});

describe("POST deposit /event", () => {
  it("should create account with initial balance", async () => {
    const eventResponse = await request(app).post("/event").send({
      type: "deposit",
      destination: "100",
      amount: 10,
    });

    expect(eventResponse.status).toBe(201);
    expect(eventResponse.body).toStrictEqual({
      destination: { id: "100", balance: 10 },
    });

    const balanceResponse = await request(app)
      .get("/balance")
      .query({ account_id: "100" });

    expect(balanceResponse.status).toBe(200);
    expect(balanceResponse.body).toBe(10);
  });

  it("should deposit amount into existing account", async () => {
    await request(app).post("/event").send({
      type: "deposit",
      destination: "100",
      amount: 10,
    });

    const eventResponse = await request(app).post("/event").send({
      type: "deposit",
      destination: "100",
      amount: 10,
    });

    expect(eventResponse.status).toBe(201);
    expect(eventResponse.body).toStrictEqual({
      destination: { id: "100", balance: 20 },
    });

    const balanceResponse = await request(app)
      .get("/balance")
      .query({ account_id: "100" });

    expect(balanceResponse.status).toBe(200);
    expect(balanceResponse.body).toBe(20);
  });

  it("should return 400 when sending deposit request without amount", async () => {
    const eventResponse = await request(app).post("/event").send({
      type: "deposit",
      destination: "100",
    });

    expect(eventResponse.status).toBe(400);
    expect(eventResponse.text).toBe("MISSING_PARAMS");

    const balanceResponse = await request(app).get("/balance").query({
      account_id: "100",
    });

    expect(balanceResponse.status).toBe(404);
    expect(balanceResponse.body).toBe(0);
  });

  it("should return 400 when sending deposit request without destination", async () => {
    const eventResponse = await request(app).post("/event").send({
      type: "deposit",
      amount: 10,
    });

    expect(eventResponse.status).toBe(400);
    expect(eventResponse.text).toBe("MISSING_PARAMS");

    const balanceResponse = await request(app).get("/balance").query({
      account_id: "100",
    });

    expect(balanceResponse.status).toBe(404);
    expect(balanceResponse.body).toBe(0);
  });

  it("should return 400 when sending deposit request with amount < 0", async () => {
    const eventResponse = await request(app).post("/event").send({
      type: "deposit",
      destination: "100",
      amount: -1,
    });

    expect(eventResponse.status).toBe(400);
    expect(eventResponse.text).toBe("INVALID_AMOUNT");

    const balanceResponse = await request(app).get("/balance").query({
      account_id: "100",
    });

    expect(balanceResponse.status).toBe(404);
    expect(balanceResponse.body).toBe(0);
  });
});

describe("POST withdraw /event", () => {
  it("should withdraw from existing account", async () => {
    await request(app).post("/event").send({
      type: "deposit",
      destination: "100",
      amount: 10,
    });

    const eventResponse = await request(app).post("/event").send({
      type: "withdraw",
      origin: "100",
      amount: 5,
    });

    expect(eventResponse.status).toBe(201);
    expect(eventResponse.body).toStrictEqual({
      origin: {
        id: "100",
        balance: 5,
      },
    });

    const balanceResponse = await request(app)
      .get("/balance")
      .query({ account_id: "100" });

    expect(balanceResponse.status).toBe(200);
    expect(balanceResponse.body).toBe(5);
  });

  it("should return 404 when withdrawing from non existing account", async () => {
    const eventResponse = await request(app).post("/event").send({
      type: "withdraw",
      origin: "200",
      amount: 10,
    });

    expect(eventResponse.status).toBe(404);
    expect(eventResponse.body).toBe(0);
  });

  it("should return 400 when sending destination instead of origin in request", async () => {
    await request(app).post("/event").send({
      type: "deposit",
      destination: "100",
      amount: 10,
    });

    const eventResponse = await request(app).post("/event").send({
      type: "withdraw",
      destination: "100",
      amount: 15,
    });

    expect(eventResponse.status).toBe(400);
    expect(eventResponse.text).toBe("MISSING_PARAMS");

    const balanceResponse = await request(app)
      .get("/balance")
      .query({ account_id: "100" });

    expect(balanceResponse.status).toBe(200);
    expect(balanceResponse.body).toBe(10);
  });

  it("should return 400 when balance is insufficient ", async () => {
    await request(app).post("/event").send({
      type: "deposit",
      destination: "100",
      amount: 10,
    });

    const eventResponse = await request(app).post("/event").send({
      type: "withdraw",
      origin: "100",
      amount: 15,
    });

    expect(eventResponse.status).toBe(400);
    expect(eventResponse.text).toBe("INSUFFICIENT_FUNDS");

    const balanceResponse = await request(app)
      .get("/balance")
      .query({ account_id: "100" });

    expect(balanceResponse.status).toBe(200);
    expect(balanceResponse.body).toBe(10);
  });

  it("should return 400 when sending withdrawing request without amount", async () => {
    const eventResponse = await request(app).post("/event").send({
      type: "withdraw",
      origin: 100,
    });

    expect(eventResponse.status).toBe(400);
    expect(eventResponse.text).toBe("MISSING_PARAMS");

    const balanceResponse = await request(app).get("/balance").query({
      account_id: "100",
    });

    expect(balanceResponse.status).toBe(404);
    expect(balanceResponse.body).toBe(0);
  });

  it("should return 400 when sending withdrawing request without origin", async () => {
    const eventResponse = await request(app).post("/event").send({
      type: "withdraw",
      amount: "100",
    });

    expect(eventResponse.status).toBe(400);
    expect(eventResponse.text).toBe("MISSING_PARAMS");

    const balanceResponse = await request(app).get("/balance").query({
      account_id: "100",
    });

    expect(balanceResponse.status).toBe(404);
    expect(balanceResponse.body).toBe(0);
  });

  it("should return 400 when sending withdraw request with amount < 0", async () => {
    await request(app).post("/event").send({
      type: "deposit",
      destination: "100",
      amount: 10,
    });

    const eventResponse = await request(app).post("/event").send({
      type: "withdraw",
      origin: "100",
      amount: -10,
    });

    expect(eventResponse.status).toBe(400);
    expect(eventResponse.text).toBe("INVALID_AMOUNT");

    const balanceResponse = await request(app).get("/balance").query({
      account_id: "100",
    });

    expect(balanceResponse.status).toBe(200);
    expect(balanceResponse.body).toBe(10);
  });
});
