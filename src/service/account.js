import { accountRepository } from "../repositories/account.js";

export default function accountService({ type, origin, destination, amount }) {
  switch (type) {
    case "get_balance":
      return getBalance({ id: destination });
    case "deposit":
      return deposit({ id: destination, amount });
    case "withdraw":
      return withdraw({ id: origin, amount });
  }

  function getBalance({ id }) {
    const account = accountRepository.findById(id);

    if (!account) {
      throw new Error("ACCOUNT_NOT_FOUND");
    }

    return account.balance;
  }

  function deposit({ id, amount }) {
    if (!id) {
      throw new Error("INVALID_PARAM");
    }

    const account = accountRepository.findById(id);

    if (!account) {
      const newAccount = {
        id: destination,
        balance: amount,
      };

      return { destination: accountRepository.save(newAccount) };
    }

    account.balance += amount;
    return { destination: accountRepository.save(account) };
  }

  function withdraw({ id, amount }) {
    if (!id) {
      throw new Error("INVALID_PARAM");
    }

    const account = accountRepository.findById(id);

    if (!account) {
      throw new Error("ACCOUNT_NOT_FOUND");
    }

    if (amount > account.balance) {
      throw new Error("INSUFFICIENT_FUNDS");
    }

    account.balance -= amount;
    return { origin: accountRepository.save(account) };
  }
}
