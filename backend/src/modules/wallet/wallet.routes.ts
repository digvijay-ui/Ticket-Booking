import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  addMoneyController,
  getWalletBalanceController,
  getWalletTransactionsController
} from "./wallet.controller";

const walletRoutes = Router();

walletRoutes.post("/add-money", authMiddleware, addMoneyController);
walletRoutes.get("/balance", authMiddleware, getWalletBalanceController);
walletRoutes.get("/transactions", authMiddleware, getWalletTransactionsController);

export { walletRoutes };
