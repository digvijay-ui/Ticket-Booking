import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  adminLoginController,
  loginController,
  meController,
  signupController
} from "./user.controller";

const userRoutes = Router();

userRoutes.post("/signup", signupController);
userRoutes.post("/login", loginController);
userRoutes.post("/admin-login", adminLoginController);
userRoutes.get("/me", authMiddleware, meController);

export { userRoutes };
