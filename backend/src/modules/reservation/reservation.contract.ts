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

export const reserveSeatsSchema = z
  .object({
    eventId: objectIdSchema("eventId"),
    seatIds: z
      .array(objectIdSchema("seatId"), {
        required_error: "seatIds is required",
        invalid_type_error: "seatIds must be an array"
      })
      .min(1, "seatIds must be a non-empty array")
  })
  .refine((data) => new Set(data.seatIds).size === data.seatIds.length, {
    message: "seatIds must not contain duplicate ids",
    path: ["seatIds"]
  });

export type ReserveSeatsInput = z.infer<typeof reserveSeatsSchema>;
