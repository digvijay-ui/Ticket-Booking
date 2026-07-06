import cors from "cors";
import express from "express";
import { healthRoutes } from "./modules/health/health.routes";
import { userRoutes } from "./modules/user/user.routes";
import { walletRoutes } from "./modules/wallet/wallet.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/wallet", walletRoutes);

export { app };
