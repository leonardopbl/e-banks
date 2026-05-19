import { describe, it, test, expect, beforeEach } from "vitest";
import request from "supertest";

import { app } from "../src/app.js";

beforeEach(async () => {
  await request(app).post("/reset");
});

test("should return 400 when sending request with invalid type", async () => {
  const eventResponse = await request(app).post("/event").send({
    type: "invalid",
    destination: "100",
    amount: 10,
  });

  expect(eventResponse.status).toBe(400);
  expect(eventResponse.text).toBe("INVALID_TYPE_PARAM");

  const balanceResponse = await request(app).get("/balance").query({
    account_id: "100",
  });

  expect(balanceResponse.status).toBe(404);
  expect(balanceResponse.body).toBe(0);
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

  it("should return 400 when sending deposit request with typeof amount !== number", async () => {
    const eventResponse = await request(app).post("/event").send({
      type: "deposit",
      destination: "100",
      amount: "10",
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
      amount: 100,
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

  it("should return 400 when sending withdraw request with typeof amount !== number", async () => {
    const eventResponse = await request(app).post("/event").send({
      type: "withdraw",
      destination: "100",
      amount: "10",
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

describe("POST transfer /event", () => {
  it("should transfer balance from origin account to destination account", async () => {
    await request(app).post("/event").send({
      type: "deposit",
      destination: "100",
      amount: 15,
    });

    const eventResponse = await request(app).post("/event").send({
      type: "transfer",
      destination: "300",
      origin: "100",
      amount: 15,
    });

    expect(eventResponse.status).toBe(201);
    expect(eventResponse.body).toStrictEqual({
      origin: {
        id: "100",
        balance: 0,
      },
      destination: {
        id: "300",
        balance: 15,
      },
    });

    const balanceOriginResponse = await request(app)
      .get("/balance")
      .query({ account_id: "100" });

    expect(balanceOriginResponse.status).toBe(200);
    expect(balanceOriginResponse.body).toBe(0);

    const balanceDestinatioResponse = await request(app)
      .get("/balance")
      .query({ account_id: "300" });

    expect(balanceDestinatioResponse.status).toBe(200);
    expect(balanceDestinatioResponse.body).toBe(15);
  });

  it("should return 404 when origin account does not exist", async () => {
    const eventResponse = await request(app).post("/event").send({
      type: "transfer",
      destination: "100",
      origin: "200",
      amount: 10,
    });

    expect(eventResponse.status).toBe(404);
    expect(eventResponse.body).toBe(0);

    const destinationBalanceResponse = await request(app)
      .get("/balance")
      .query({ account_id: "200" });

    expect(destinationBalanceResponse.status).toBe(404);
    expect(destinationBalanceResponse.body).toBe(0);

    const originBalanceResponse = await request(app)
      .get("/balance")
      .query({ account_id: "100" });

    expect(originBalanceResponse.status).toBe(404);
    expect(originBalanceResponse.body).toBe(0);
  });

  it("should return 400 when sending origin === destination", async () => {
    await request(app).post("/event").send({
      type: "deposit",
      destination: "100",
      amount: 30,
    });

    const eventResponse = await request(app).post("/event").send({
      type: "transfer",
      destination: "100",
      origin: "100",
      amount: 100,
    });

    expect(eventResponse.status).toBe(400);
    expect(eventResponse.text).toBe("INVALID_PARAMS");

    const balanceResponse = await request(app).get("/balance").query({
      account_id: "100",
    });

    expect(balanceResponse.status).toBe(200);
    expect(balanceResponse.body).toBe(30);
  });

  it("should return 400 when transfer balance from origin with insufficient funds", async () => {
    await request(app).post("/event").send({
      type: "deposit",
      destination: "100",
      amount: 30,
    });

    const eventResponse = await request(app).post("/event").send({
      type: "transfer",
      destination: "200",
      origin: "100",
      amount: 100,
    });

    expect(eventResponse.status).toBe(400);
    expect(eventResponse.text).toBe("INSUFFICIENT_FUNDS");

    const balanceOriginResponse = await request(app).get("/balance").query({
      account_id: "100",
    });

    expect(balanceOriginResponse.status).toBe(200);
    expect(balanceOriginResponse.body).toBe(30);

    const balanceDestinatioResponse = await request(app).get("/balance").query({
      account_id: "200",
    });

    expect(balanceDestinatioResponse.status).toBe(404);
    expect(balanceDestinatioResponse.body).toBe(0);
  });
});
