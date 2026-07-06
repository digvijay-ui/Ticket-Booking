import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { SafeUser } from "../modules/user/user.service";
import { UserModel } from "../modules/user/user.model";

export interface AuthenticatedRequest extends Request {
  user?: SafeUser;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authorization token is required"
      });
      return;
    }

    const token = authorizationHeader.split(" ")[1];
    const payload = verifyToken(token);
    const user = await UserModel.findById(payload.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found"
      });
      return;
    }

    req.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      walletBalanceInPaise: user.walletBalanceInPaise
    };

    next();
  } catch (_error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};
