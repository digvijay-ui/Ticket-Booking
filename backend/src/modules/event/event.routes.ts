import { Router } from "express";
import { adminMiddleware } from "../../middleware/admin.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  cancelEventController,
  createEventController,
  getEventController,
  listEventsController,
  updateEventController
} from "./event.controller";

const eventRoutes = Router();

eventRoutes.post(
  "/admin/events",
  authMiddleware,
  adminMiddleware,
  createEventController
);
eventRoutes.patch(
  "/admin/events/:eventId",
  authMiddleware,
  adminMiddleware,
  updateEventController
);
eventRoutes.delete(
  "/admin/events/:eventId",
  authMiddleware,
  adminMiddleware,
  cancelEventController
);

eventRoutes.get("/events", listEventsController);
eventRoutes.get("/events/:eventId", getEventController);

export { eventRoutes };
