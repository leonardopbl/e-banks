import { Router } from "express";

import { createEvent } from "../controllers/event.js";

export const routes = Router();

routes.post("/event", createEvent);
