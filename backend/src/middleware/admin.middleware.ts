import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "./auth.middleware";

export const adminMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== "ADMIN") {
    res.status(403).json({
      success: false,
      message: "Admin access required"
    });
    return;
  }

  next();
};
