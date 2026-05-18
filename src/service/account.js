import { accountRepository } from "../repositories/account.js";

export default function accountService({ type, origin, destination, amount }) {
  switch (type) {
    case "deposit":
      return deposit({ destination, amount });
  }

  function deposit({ destination, amount }) {
    const account = accountRepository.findById({ id: destination });
    if (!account) {
      const newAccount = {
        id: destination,
        balance: amount,
      };

      return accountRepository.save(newAccount);
    }

    account.balance += amount;
    return save(account);
  }
}
