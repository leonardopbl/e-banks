import { accountRepository } from "../repositories/account.js";

export default function accountService({ type, origin, destination, amount }) {
  switch (type) {
    case "check_balance":
      return checkBalance({ id: destination });
    case "deposit":
      return deposit({ id: destination, amount });
  }
  function checkBalance(id) {
    return accountRepository.findById(id);
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
