import accountService from "../service/account.js";

export function createEvent(req, res) {
  const { type, origin, destination, amount } = req.body;

  try {
    const result = accountService({
      type,
      origin,
      destination,
      amount,
    });

    return res.status(201).json(result);
  } catch (error) {
    if (error.message === "ACCOUNT_NOT_FOUND") {
      return res.status(404).send(0);
    }

    if (error.message === "INVALID_PARAM") {
      return res.status(400).send("INVALID_PARAM");
    }

    if (error.message === "INSUFFICIENT_FUNDS") {
      return res.status(400).send("INSUFFICIENT_FUNDS");
    }

    return res.status(500).json({
      error: "Error during event process",
    });
  }
}
