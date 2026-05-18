import accountService from "../service/account.js";

export function getBalance(req, res) {
  const { account_id } = req.query;

  try {
    const result = accountService({
      type: "check_balance",
      destination: account_id,
    });

    return res.status(201).json(result.balance);
  } catch (error) {
    return res.status(400).json({
      error: "Error during get balance process",
    });
  }
}
