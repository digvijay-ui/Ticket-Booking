import { Types } from "mongoose";
import { z } from "zod";

const objectIdSchema = (fieldName: string) =>
  z
    .string({
      required_error: `${fieldName} is required`,
      invalid_type_error: `${fieldName} must be a string`
    })
    .refine((value) => Types.ObjectId.isValid(value), {
      message: `${fieldName} must be a valid MongoDB ObjectId`
    });

export const confirmBookingSchema = z.object({
  reservationId: objectIdSchema("reservationId"),
  idempotencyKey: z
    .string({
      required_error: "idempotencyKey is required",
      invalid_type_error: "idempotencyKey must be a string"
    })
    .trim()
    .min(8, "idempotencyKey must be at least 8 characters")
});

export type ConfirmBookingInput = z.infer<typeof confirmBookingSchema>;
