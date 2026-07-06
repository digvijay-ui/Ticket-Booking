import { z } from "zod";

const positiveIntegerSchema = (fieldName: string) =>
  z
    .number({
      required_error: `${fieldName} is required`,
      invalid_type_error: `${fieldName} must be a number`
    })
    .int(`${fieldName} must be an integer`)
    .positive(`${fieldName} must be greater than 0`);

export const bulkCreateSeatsSchema = z.object({
  rows: z
    .array(z.string().trim().min(1, "Row cannot be empty"))
    .min(1, "rows cannot be empty"),
  seatsPerRow: positiveIntegerSchema("seatsPerRow"),
  priceInPaise: positiveIntegerSchema("priceInPaise").optional()
});

export type BulkCreateSeatsInput = z.infer<typeof bulkCreateSeatsSchema>;
