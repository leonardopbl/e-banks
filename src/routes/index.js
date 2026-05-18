import { Router } from "express";

export const routes = Router();

routes.use("/", (req, res) => {
  res.json({
    status: "ON",
    timestamp: new Date(),
  });
});
