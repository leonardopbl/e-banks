import { accountRepository } from "../repositories/account.js";

export default function accountService({ type, origin, destination, amount }) {
  switch (type) {
    case "get_balance":
      return getBalance({ id: destination });
    case "deposit":
      return deposit({ id: destination, amount });
  }

  function getBalance({ id }) {
    const account = accountRepository.findById(id);

    if (!account) {
      throw new Error("ACCOUNT_NOT_FOUND");
    }

    return account.balance;
  }

  function deposit({ id, amount }) {
    const account = accountRepository.findById(id);
    if (!account) {
      const newAccount = {
        id: destination,
        balance: amount,
      };

      return accountRepository.save(newAccount);
    }

    account.balance += amount;
    return accountRepository.save(account);
  }
}
