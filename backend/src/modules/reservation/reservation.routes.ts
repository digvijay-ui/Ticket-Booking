import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { reserveSeatsController } from "./reservation.controller";

const reservationRoutes = Router();

reservationRoutes.post("/reserve", authMiddleware, reserveSeatsController);

export { reservationRoutes };
