import express from "express";

export const app = express();

app.get("/", (req, res) => {
  res.json({
    status: "ON",
    timestamp: new Date(),
  });
});
