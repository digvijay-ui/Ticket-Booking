import mongoose, { ClientSession, Types } from "mongoose";
import { UserModel } from "../user/user.model";
import {
  IWalletTransaction,
  WalletReferenceType,
  WalletTransactionModel,
  WalletTransactionType
} from "../walletTransaction/walletTransaction.model";

export class WalletError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export interface SafeWalletTransaction {
  id: string;
  type: WalletTransactionType;
  amountInPaise: number;
  balanceAfterInPaise: number;
  description: string;
  referenceType: WalletReferenceType;
  referenceId?: string;
  idempotencyKey?: string;
  createdAt: Date;
}

export interface WalletMutationResult {
  walletBalanceInPaise: number;
  transaction: SafeWalletTransaction;
}

interface WalletMutationParams {
  userId: string;
  amountInPaise: number;
  referenceId: string;
  description: string;
  idempotencyKey?: string;
  session?: ClientSession;
}

const assertPositiveIntegerAmount = (amountInPaise: number): void => {
  if (!Number.isInteger(amountInPaise) || amountInPaise <= 0) {
    throw new WalletError("amountInPaise must be a positive integer", 400);
  }
};

const toObjectId = (userId: string): Types.ObjectId => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new WalletError("Invalid user id", 400);
  }

  return new Types.ObjectId(userId);
};

const toSafeTransaction = (
  transaction: IWalletTransaction & { _id: unknown }
): SafeWalletTransaction => ({
  id: String(transaction._id),
  type: transaction.type,
  amountInPaise: transaction.amountInPaise,
  balanceAfterInPaise: transaction.balanceAfterInPaise,
  description: transaction.description,
  referenceType: transaction.referenceType,
  referenceId: transaction.referenceId,
  idempotencyKey: transaction.idempotencyKey,
  createdAt: transaction.createdAt
});

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: number }).code === 11000;

const ensureNoDuplicateIdempotencyKey = async (
  userId: Types.ObjectId,
  idempotencyKey: string | undefined,
  session: ClientSession
): Promise<void> => {
  if (!idempotencyKey) {
    return;
  }

  const existingTransaction = await WalletTransactionModel.findOne({
    userId,
    idempotencyKey
  }).session(session);

  if (existingTransaction) {
    throw new WalletError("Duplicate idempotencyKey", 409);
  }
};

const createTransaction = async (
  input: Omit<IWalletTransaction, "createdAt" | "updatedAt">,
  session: ClientSession
): Promise<SafeWalletTransaction> => {
  try {
    const [transaction] = await WalletTransactionModel.create([input], { session });
    return toSafeTransaction(transaction);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new WalletError("Duplicate idempotencyKey", 409);
    }

    throw error;
  }
};

const withWalletSession = async <T>(
  existingSession: ClientSession | undefined,
  work: (session: ClientSession) => Promise<T>
): Promise<T> => {
  if (existingSession) {
    return work(existingSession);
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const result = await work(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const addMoney = async (
  userId: string,
  amountInPaise: number
): Promise<WalletMutationResult> => {
  assertPositiveIntegerAmount(amountInPaise);
  const userObjectId = toObjectId(userId);

  return withWalletSession(undefined, async (session) => {
    const user = await UserModel.findByIdAndUpdate(
      userObjectId,
      { $inc: { walletBalanceInPaise: amountInPaise } },
      { new: true, session }
    );

    if (!user) {
      throw new WalletError("User not found", 404);
    }

    const transaction = await createTransaction(
      {
        userId: userObjectId,
        type: "CREDIT",
        amountInPaise,
        balanceAfterInPaise: user.walletBalanceInPaise,
        description: "Money added to wallet",
        referenceType: "ADD_MONEY"
      },
      session
    );

    return {
      walletBalanceInPaise: user.walletBalanceInPaise,
      transaction
    };
  });
};

export const getWalletBalance = async (userId: string): Promise<number> => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new WalletError("User not found", 404);
  }

  return user.walletBalanceInPaise;
};

export const getWalletTransactions = async (
  userId: string
): Promise<SafeWalletTransaction[]> => {
  const userObjectId = toObjectId(userId);
  const transactions = await WalletTransactionModel.find({ userId: userObjectId })
    .sort({ createdAt: -1 })
    .lean();

  return transactions.map((transaction) => toSafeTransaction(transaction));
};

export const debitWallet = async (
  params: WalletMutationParams
): Promise<WalletMutationResult> => {
  assertPositiveIntegerAmount(params.amountInPaise);
  const userObjectId = toObjectId(params.userId);

  return withWalletSession(params.session, async (session) => {
    await ensureNoDuplicateIdempotencyKey(
      userObjectId,
      params.idempotencyKey,
      session
    );

    const user = await UserModel.findOneAndUpdate(
      {
        _id: userObjectId,
        walletBalanceInPaise: { $gte: params.amountInPaise }
      },
      { $inc: { walletBalanceInPaise: -params.amountInPaise } },
      { new: true, session }
    );

    if (!user) {
      throw new WalletError("Insufficient wallet balance", 400);
    }

    const transaction = await createTransaction(
      {
        userId: userObjectId,
        type: "DEBIT",
        amountInPaise: params.amountInPaise,
        balanceAfterInPaise: user.walletBalanceInPaise,
        description: params.description,
        referenceType: "BOOKING",
        referenceId: params.referenceId,
        idempotencyKey: params.idempotencyKey
      },
      session
    );

    return {
      walletBalanceInPaise: user.walletBalanceInPaise,
      transaction
    };
  });
};

export const refundWallet = async (
  params: WalletMutationParams
): Promise<WalletMutationResult> => {
  assertPositiveIntegerAmount(params.amountInPaise);
  const userObjectId = toObjectId(params.userId);

  return withWalletSession(params.session, async (session) => {
    await ensureNoDuplicateIdempotencyKey(
      userObjectId,
      params.idempotencyKey,
      session
    );

    const user = await UserModel.findByIdAndUpdate(
      userObjectId,
      { $inc: { walletBalanceInPaise: params.amountInPaise } },
      { new: true, session }
    );

    if (!user) {
      throw new WalletError("User not found", 404);
    }

    const transaction = await createTransaction(
      {
        userId: userObjectId,
        type: "REFUND",
        amountInPaise: params.amountInPaise,
        balanceAfterInPaise: user.walletBalanceInPaise,
        description: params.description,
        referenceType: "REFUND",
        referenceId: params.referenceId,
        idempotencyKey: params.idempotencyKey
      },
      session
    );

    return {
      walletBalanceInPaise: user.walletBalanceInPaise,
      transaction
    };
  });
};
