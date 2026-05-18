import { accountRepository } from "../repositories/account.js";

export function resetState(req, res) {
  try {
    accountRepository.clear();

    res.status(200).send("OK");
  } catch {
    return res.status(400).json({
      error: "Error during reset state process",
    });
  }
}
