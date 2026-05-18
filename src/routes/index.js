import { Router } from "express";

import { createEvent } from "../controllers/event.js";
import { getBalance } from "../controllers/balance.js";

export const routes = Router();

routes.post("/event", createEvent);
routes.get("/balance", getBalance);
