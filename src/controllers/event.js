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
    return res.status(400).json({
      error: "Error during event process",
    });
  }
}
