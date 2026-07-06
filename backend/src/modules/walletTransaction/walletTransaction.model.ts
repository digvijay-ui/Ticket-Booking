import { Schema, Types, model } from "mongoose";

export type WalletTransactionType = "CREDIT" | "DEBIT" | "REFUND";
export type WalletReferenceType = "ADD_MONEY" | "BOOKING" | "REFUND";

export interface IWalletTransaction {
  userId: Types.ObjectId;
  type: WalletTransactionType;
  amountInPaise: number;
  balanceAfterInPaise: number;
  description: string;
  referenceType: WalletReferenceType;
  referenceId?: string;
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const walletTransactionSchema = new Schema<IWalletTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      enum: ["CREDIT", "DEBIT", "REFUND"],
      required: true
    },
    amountInPaise: {
      type: Number,
      required: true,
      min: 1
    },
    balanceAfterInPaise: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    referenceType: {
      type: String,
      enum: ["ADD_MONEY", "BOOKING", "REFUND"],
      required: true
    },
    referenceId: {
      type: String,
      trim: true
    },
    idempotencyKey: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

walletTransactionSchema.index({ userId: 1, createdAt: -1 });
walletTransactionSchema.index({ referenceType: 1, referenceId: 1 });
walletTransactionSchema.index(
  { userId: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      idempotencyKey: { $type: "string" }
    }
  }
);

export const WalletTransactionModel = model<IWalletTransaction>(
  "WalletTransaction",
  walletTransactionSchema
);
