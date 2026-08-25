import { Router } from "express";
import { adminMiddleware } from "../../middleware/admin.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  cancelEventController,
  createEventController,
  deleteEventController,
  getEventController,
  listAdminEventsController,
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
eventRoutes.get(
  "/admin/events",
  authMiddleware,
  adminMiddleware,
  listAdminEventsController
);
eventRoutes.patch(
  "/admin/events/:eventId",
  authMiddleware,
  adminMiddleware,
  updateEventController
);
eventRoutes.post(
  "/admin/events/:eventId/cancel",
  authMiddleware,
  adminMiddleware,
  cancelEventController
);
eventRoutes.delete(
  "/admin/events/:eventId",
  authMiddleware,
  adminMiddleware,
  deleteEventController
);

eventRoutes.get("/events", listEventsController);
eventRoutes.get("/events/:eventId", getEventController);

export { eventRoutes };
