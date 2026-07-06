import { z } from "zod";

const amountInPaiseSchema = z
  .number({
    required_error: "amountInPaise is required",
    invalid_type_error: "amountInPaise must be a number"
  })
  .int("amountInPaise must be an integer")
  .positive("amountInPaise must be greater than 0");

export const addMoneySchema = z.object({
  amountInPaise: amountInPaiseSchema
});

export const debitWalletSchema = z.object({
  amountInPaise: amountInPaiseSchema,
  referenceType: z.literal("BOOKING"),
  referenceId: z.string().trim().min(1, "referenceId is required"),
  description: z.string().trim().min(1, "description is required"),
  idempotencyKey: z.string().trim().min(1).optional()
});

export const refundWalletSchema = z.object({
  amountInPaise: amountInPaiseSchema,
  referenceType: z.literal("REFUND"),
  referenceId: z.string().trim().min(1, "referenceId is required"),
  description: z.string().trim().min(1, "description is required"),
  idempotencyKey: z.string().trim().min(1).optional()
});

export type AddMoneyInput = z.infer<typeof addMoneySchema>;
export type DebitWalletInput = z.infer<typeof debitWalletSchema>;
export type RefundWalletInput = z.infer<typeof refundWalletSchema>;
