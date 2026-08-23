import { Router } from "express";
import { adminMiddleware } from "../../middleware/admin.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  getAnalyticsSummaryController,
  getBookingStatusAnalyticsController,
  getRevenueAnalyticsController,
  getSeatStatusAnalyticsController,
  getTopEventsAnalyticsController,
  getWalletFlowAnalyticsController
} from "./adminAnalytics.controller";

const adminAnalyticsRoutes = Router();

adminAnalyticsRoutes.use(authMiddleware, adminMiddleware);

adminAnalyticsRoutes.get("/summary", getAnalyticsSummaryController);
adminAnalyticsRoutes.get("/revenue", getRevenueAnalyticsController);
adminAnalyticsRoutes.get(
  "/booking-status",
  getBookingStatusAnalyticsController
);
adminAnalyticsRoutes.get("/seat-status", getSeatStatusAnalyticsController);
adminAnalyticsRoutes.get("/top-events", getTopEventsAnalyticsController);
adminAnalyticsRoutes.get("/wallet-flow", getWalletFlowAnalyticsController);

export { adminAnalyticsRoutes };
