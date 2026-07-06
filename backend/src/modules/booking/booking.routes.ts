import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { confirmBookingController } from "./booking.controller";

const bookingRoutes = Router();

bookingRoutes.post("/confirm", authMiddleware, confirmBookingController);

export { bookingRoutes };
