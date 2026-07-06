import { Response } from "express";
import { ZodError } from "zod";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { addMoneySchema } from "./wallet.contract";
import {
  WalletError,
  addMoney,
  getWalletBalance,
  getWalletTransactions
} from "./wallet.service";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ZodError) {
    return error.errors.map((issue) => issue.message).join(", ");
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
};

const getStatusCode = (error: unknown): number => {
  if (error instanceof ZodError) {
    return 400;
  }

  if (error instanceof WalletError) {
    return error.statusCode;
  }

  return 500;
};

const getAuthenticatedUserId = (req: AuthenticatedRequest): string => {
  const userId = req.user?.id;

  if (!userId) {
    throw new WalletError("Unauthorized", 401);
  }

  return userId;
};

export const addMoneyController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);
    const input = addMoneySchema.parse(req.body);
    const data = await addMoney(userId, input.amountInPaise);

    res.status(200).json({
      success: true,
      message: "Money added to wallet successfully",
      data
    });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};

export const getWalletBalanceController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);
    const walletBalanceInPaise = await getWalletBalance(userId);

    res.status(200).json({
      success: true,
      message: "Wallet balance fetched successfully",
      data: {
        walletBalanceInPaise
      }
    });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};

export const getWalletTransactionsController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);
    const transactions = await getWalletTransactions(userId);

    res.status(200).json({
      success: true,
      message: "Wallet transactions fetched successfully",
      data: {
        transactions
      }
    });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};
