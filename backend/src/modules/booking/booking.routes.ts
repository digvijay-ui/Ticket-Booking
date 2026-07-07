import { Router } from "express";
import { adminMiddleware } from "../../middleware/admin.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  cancelBookingController,
  confirmBookingController,
  getAdminBookingsController,
  getAdminTransactionsController,
  getMyBookingsController,
  refundBookingController
} from "./booking.controller";

const bookingRoutes = Router();
const adminBookingRoutes = Router();

bookingRoutes.post("/confirm", authMiddleware, confirmBookingController);
bookingRoutes.get("/my-bookings", authMiddleware, getMyBookingsController);

adminBookingRoutes.get(
  "/bookings",
  authMiddleware,
  adminMiddleware,
  getAdminBookingsController
);
adminBookingRoutes.get(
  "/transactions",
  authMiddleware,
  adminMiddleware,
  getAdminTransactionsController
);
adminBookingRoutes.post(
  "/bookings/:bookingId/cancel",
  authMiddleware,
  adminMiddleware,
  cancelBookingController
);
adminBookingRoutes.post(
  "/bookings/:bookingId/refund",
  authMiddleware,
  adminMiddleware,
  refundBookingController
);

export { adminBookingRoutes, bookingRoutes };
