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
