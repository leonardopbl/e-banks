import { Router } from "express";

import { resetState } from "../controllers/reset.js";
import { getBalance } from "../controllers/balance.js";
import { createEvent } from "../controllers/event.js";

export const routes = Router();

routes.post("/reset", resetState);
routes.post("/event", createEvent);
routes.get("/balance", getBalance);
