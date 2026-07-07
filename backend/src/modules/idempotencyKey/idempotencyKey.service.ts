import crypto from "crypto";
import { Types } from "mongoose";
import {
  IIdempotencyKey,
  IdempotencyKeyModel
} from "./idempotencyKey.model";

export class IdempotencyError extends Error {
  statusCode: number;
  responseBody?: unknown;

  constructor(message: string, statusCode: number, responseBody?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }
}

interface StartIdempotencyInput {
  key: string;
  userId: string;
  endpoint: string;
  requestBody: unknown;
}

interface CompleteIdempotencyInput {
  idempotencyRecordId: string;
  responseBody: unknown;
  statusCode: number;
}

const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const objectValue = value as Record<string, unknown>;
  return `{${Object.keys(objectValue)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(objectValue[key])}`)
    .join(",")}}`;
};

export const createRequestHash = (requestBody: unknown): string =>
  crypto.createHash("sha256").update(stableStringify(requestBody)).digest("hex");

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: number }).code === 11000;

export const startIdempotentRequest = async ({
  key,
  userId,
  endpoint,
  requestBody
}: StartIdempotencyInput): Promise<IIdempotencyKey & { _id: unknown }> => {
  const userObjectId = new Types.ObjectId(userId);
  const requestHash = createRequestHash(requestBody);

  const existingRecord = await IdempotencyKeyModel.findOne({
    userId: userObjectId,
    key,
    endpoint
  });

  if (existingRecord) {
    if (existingRecord.requestHash !== requestHash) {
      throw new IdempotencyError("Idempotency key reused with different request", 409);
    }

    if (existingRecord.status === "COMPLETED") {
      throw new IdempotencyError(
        "Idempotency response replay",
        existingRecord.statusCode || 200,
        existingRecord.responseBody
      );
    }

    if (existingRecord.status === "PROCESSING") {
      throw new IdempotencyError("Request already processing", 409);
    }

    throw new IdempotencyError(
      "Idempotency response replay",
      existingRecord.statusCode || 500,
      existingRecord.responseBody
    );
  }

  try {
    const record = await IdempotencyKeyModel.create({
      userId: userObjectId,
      key,
      endpoint,
      requestHash,
      status: "PROCESSING"
    });

    return record;
  } catch (error) {
    if (!isDuplicateKeyError(error)) {
      throw error;
    }

    const concurrentRecord = await IdempotencyKeyModel.findOne({
      userId: userObjectId,
      key,
      endpoint
    });

    if (concurrentRecord?.status === "COMPLETED") {
      throw new IdempotencyError(
        "Idempotency response replay",
        concurrentRecord.statusCode || 200,
        concurrentRecord.responseBody
      );
    }

    throw new IdempotencyError("Request already processing", 409);
  }
};

export const completeIdempotentRequest = async ({
  idempotencyRecordId,
  responseBody,
  statusCode
}: CompleteIdempotencyInput): Promise<void> => {
  await IdempotencyKeyModel.findByIdAndUpdate(idempotencyRecordId, {
    $set: {
      responseBody,
      statusCode,
      status: "COMPLETED"
    }
  });
};

export const failIdempotentRequest = async ({
  idempotencyRecordId,
  responseBody,
  statusCode
}: CompleteIdempotencyInput): Promise<void> => {
  await IdempotencyKeyModel.findByIdAndUpdate(idempotencyRecordId, {
    $set: {
      responseBody,
      statusCode,
      status: "FAILED"
    }
  });
};
