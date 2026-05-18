const accounts = new Map();

export const accountRepository = {
  save(account) {
    accounts.set(account.id, account);
    return account;
  },

  findById(id) {
    return accounts.get(id);
  },
};
