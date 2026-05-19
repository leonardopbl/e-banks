import { describe, it, expect, beforeEach } from "vitest";

import accountService from "../src/service/account.js";
import { accountRepository } from "../src/repositories/account.js";

beforeEach(async () => {
  accountRepository.clear();
});

describe("accountService", () => {
  it("should create account with balance", () => {
    const result = accountService({
      type: "deposit",
      destination: "100",
      amount: 10,
    });

    expect(result).toStrictEqual({
      destination: {
        id: "100",
        balance: 10,
      },
    });

    expect(accountRepository.findById("100")).toStrictEqual({
      id: "100",
      balance: 10,
    });
  });

  it("should increase balance with deposit into existing account", () => {
    accountService({
      type: "deposit",
      destination: "100",
      amount: 10,
    });

    const result = accountService({
      type: "deposit",
      destination: "100",
      amount: 5,
    });

    expect(result).toStrictEqual({
      destination: {
        id: "100",
        balance: 15,
      },
    });

    expect(accountRepository.findById("100").balance).toBe(15);
  });

  it("should decrease balance with withdraw", () => {
    accountService({
      type: "deposit",
      destination: "100",
      amount: 10,
    });

    const result = accountService({
      type: "withdraw",
      origin: "100",
      amount: 4,
    });

    expect(result).toStrictEqual({
      origin: {
        id: "100",
        balance: 6,
      },
    });

    expect(accountRepository.findById("100").balance).toBe(6);
  });

  it("should transfer amount from origin to destination", () => {
    accountService({
      type: "deposit",
      destination: "100",
      amount: 20,
    });

    accountService({
      type: "deposit",
      destination: "200",
      amount: 5,
    });

    const result = accountService({
      type: "transfer",
      origin: "100",
      destination: "200",
      amount: 7,
    });

    expect(result).toStrictEqual({
      origin: {
        id: "100",
        balance: 13,
      },
      destination: {
        id: "200",
        balance: 12,
      },
    });

    expect(accountRepository.findById("100").balance).toBe(13);
    expect(accountRepository.findById("200").balance).toBe(12);
  });

  it("should throw when get balance from non existing account", () => {
    expect(() =>
      accountService({
        type: "get_balance",
        origin: "100",
      }),
    ).toThrow("ACCOUNT_NOT_FOUND");
  });

  it("should throw when withdrawing from non existing account", () => {
    expect(() =>
      accountService({
        type: "withdraw",
        origin: "100",
        amount: 10,
      }),
    ).toThrow("ACCOUNT_NOT_FOUND");
  });

  it("should throw when withdrawing with insufficient funds", () => {
    accountService({
      type: "deposit",
      destination: "100",
      amount: 5,
    });

    expect(() =>
      accountService({
        type: "withdraw",
        origin: "100",
        amount: 10,
      }),
    ).toThrow("INSUFFICIENT_FUNDS");

    expect(accountRepository.findById("100").balance).toBe(5);
  });

  it("should throw when send typeof amount !== number", () => {
    expect(() =>
      accountService({
        type: "deposit",
        destination: "100",
        amount: "20",
      }),
    ).toThrow("INVALID_AMOUNT");
  });

  it("should throw when send amount === 0", () => {
    expect(() =>
      accountService({
        type: "deposit",
        destination: "100",
        amount: 0,
      }),
    ).toThrow("INVALID_AMOUNT");
  });
});
