import { Router } from "express";
import { adminMiddleware } from "../../middleware/admin.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  adminLoginController,
  adminSignupController,
  createAdminController,
  loginController,
  meController,
  signupController
} from "./user.controller";

const userRoutes = Router();

userRoutes.post("/signup", signupController);
userRoutes.post("/login", loginController);
userRoutes.post("/admin-login", adminLoginController);
userRoutes.post("/admin-signup", adminSignupController);
userRoutes.post(
  "/admin/users/admins",
  authMiddleware,
  adminMiddleware,
  createAdminController
);
userRoutes.get("/me", authMiddleware, meController);

export { userRoutes };
