import { describe, it, expect } from "vitest";
import request from "supertest";

import { app } from "../src/app.js";

describe("POST /reset", () => {
  it("should reset accounts state", async () => {
    await request(app).post("/event").send({
      type: "deposit",
      destination: "100",
      amount: 10,
    });

    const response = await request(app).post("/reset");

    expect(response.status).toBe(200);
    expect(response.text).toBe("OK");

    const balanceResponse = await request(app)
      .get("/balance")
      .query({ account_id: "100" });

    expect(balanceResponse.status).toBe(404);
    expect(balanceResponse.body).toBe(0);
  });
});
