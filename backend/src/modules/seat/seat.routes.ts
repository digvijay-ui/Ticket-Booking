import { Router } from "express";
import { adminMiddleware } from "../../middleware/admin.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  bulkCreateSeatsController,
  getAdminSeatsByEventController,
  getSeatsByEventController
} from "./seat.controller";

const seatRoutes = Router();

seatRoutes.post(
  "/admin/events/:eventId/seats/bulk",
  authMiddleware,
  adminMiddleware,
  bulkCreateSeatsController
);
seatRoutes.get(
  "/admin/events/:eventId/seats",
  authMiddleware,
  adminMiddleware,
  getAdminSeatsByEventController
);
seatRoutes.get("/events/:eventId/seats", getSeatsByEventController);

export { seatRoutes };
