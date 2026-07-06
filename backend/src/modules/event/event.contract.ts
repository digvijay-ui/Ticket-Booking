import { z } from "zod";

const amountInPaiseSchema = z
  .number({
    required_error: "seatPriceInPaise is required",
    invalid_type_error: "seatPriceInPaise must be a number"
  })
  .int("seatPriceInPaise must be an integer")
  .positive("seatPriceInPaise must be greater than 0");

const dateStringSchema = z
  .string({
    required_error: "Date is required",
    invalid_type_error: "Date must be a string"
  })
  .datetime("Date must be a valid ISO date string")
  .transform((value) => new Date(value));

export const createEventSchema = z
  .object({
    title: z.string().trim().min(2, "Title must be at least 2 characters"),
    description: z
      .string()
      .trim()
      .min(5, "Description must be at least 5 characters"),
    location: z.string().trim().min(2, "Location must be at least 2 characters"),
    startDate: dateStringSchema,
    endDate: dateStringSchema,
    seatPriceInPaise: amountInPaiseSchema,
    status: z.enum(["DRAFT", "PUBLISHED"]).optional()
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "endDate must be after startDate",
    path: ["endDate"]
  });

export const updateEventSchema = z
  .object({
    title: z.string().trim().min(2, "Title must be at least 2 characters").optional(),
    description: z
      .string()
      .trim()
      .min(5, "Description must be at least 5 characters")
      .optional(),
    location: z
      .string()
      .trim()
      .min(2, "Location must be at least 2 characters")
      .optional(),
    startDate: dateStringSchema.optional(),
    endDate: dateStringSchema.optional(),
    seatPriceInPaise: amountInPaiseSchema.optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]).optional()
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) {
        return true;
      }

      return data.endDate > data.startDate;
    },
    {
      message: "endDate must be after startDate",
      path: ["endDate"]
    }
  );

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
