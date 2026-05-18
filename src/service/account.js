import { accountRepository } from "../repositories/account.js";

export default function accountService({ type, origin, destination, amount }) {
  switch (type) {
    case "check_balance":
      return checkBalance({ destination });
    case "deposit":
      return deposit({ destination, amount });
  }
  function checkBalance({ destination }) {
    return accountRepository.findById(destination);
  }

  function deposit({ destination, amount }) {
    const account = accountRepository.findById(destination);
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
