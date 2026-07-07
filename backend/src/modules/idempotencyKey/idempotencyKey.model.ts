import { Schema, Types, model } from "mongoose";

export type IdempotencyStatus = "PROCESSING" | "COMPLETED" | "FAILED";

export interface IIdempotencyKey {
  key: string;
  userId: Types.ObjectId;
  endpoint: string;
  requestHash: string;
  responseBody?: unknown;
  statusCode?: number;
  status: IdempotencyStatus;
  createdAt: Date;
  updatedAt: Date;
}

const idempotencyKeySchema = new Schema<IIdempotencyKey>(
  {
    key: {
      type: String,
      required: true,
      trim: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    endpoint: {
      type: String,
      required: true,
      trim: true
    },
    requestHash: {
      type: String,
      required: true
    },
    responseBody: {
      type: Schema.Types.Mixed
    },
    statusCode: {
      type: Number
    },
    status: {
      type: String,
      enum: ["PROCESSING", "COMPLETED", "FAILED"],
      default: "PROCESSING"
    }
  },
  {
    timestamps: true
  }
);

idempotencyKeySchema.index(
  { userId: 1, key: 1, endpoint: 1 },
  { unique: true }
);

export const IdempotencyKeyModel = model<IIdempotencyKey>(
  "IdempotencyKey",
  idempotencyKeySchema
);
