import accountService from "../service/account.js";

export function getBalance(req, res) {
  const { account_id } = req.query;

  try {
    const result = accountService({
      type: "get_balance",
      destination: account_id,
    });

    return res.status(200).send(result);
  } catch (error) {
    if (error.message === "ACCOUNT_NOT_FOUND") {
      return res.status(404).send(0);
    }

    return res.status(400).json({
      error: "Error during get balance process",
    });
  }
}
