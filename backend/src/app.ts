import cors from "cors";
import express from "express";
import { adminBookingRoutes, bookingRoutes } from "./modules/booking/booking.routes";
import { eventRoutes } from "./modules/event/event.routes";
import { healthRoutes } from "./modules/health/health.routes";
import { reservationRoutes } from "./modules/reservation/reservation.routes";
import { seatRoutes } from "./modules/seat/seat.routes";
import { userRoutes } from "./modules/user/user.routes";
import { walletRoutes } from "./modules/wallet/wallet.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/bookings", reservationRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminBookingRoutes);
app.use("/api", seatRoutes);
app.use("/api", eventRoutes);

export { app };
