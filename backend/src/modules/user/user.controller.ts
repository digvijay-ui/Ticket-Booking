import { Request, Response } from "express";
import { ZodError } from "zod";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { loginSchema, signupSchema } from "./user.contract";
import { adminLogin, AppError, getCurrentUser, loginUser, signupUser } from "./user.service";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ZodError) {
    return error.errors.map((issue) => issue.message).join(", ");
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
};

const getStatusCode = (error: unknown, fallbackStatusCode = 500): number => {
  if (error instanceof ZodError) {
    return 400;
  }

  if (error instanceof AppError) {
    return error.statusCode;
  }

  return fallbackStatusCode;
};

export const signupController = async (req: Request, res: Response): Promise<void> => {
  try {
    const input = signupSchema.parse(req.body);
    const data = await signupUser(input);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data
    });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};

export const loginController = async (req: Request, res: Response): Promise<void> => {
  try {
    const input = loginSchema.parse(req.body);
    const data = await loginUser(input);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data
    });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};

export const adminLoginController = async (req: Request, res: Response): Promise<void> => {
  try {
    const input = loginSchema.parse(req.body);
    const data = await adminLogin(input);

    res.status(200).json({
      success: true,
      message: "Admin login successful",
      data
    });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};

export const meController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const user = await getCurrentUser(userId);

    res.status(200).json({
      success: true,
      message: "Current user fetched successfully",
      data: {
        user
      }
    });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};
