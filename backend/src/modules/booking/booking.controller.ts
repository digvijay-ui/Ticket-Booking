import { Response } from "express";
import { ZodError } from "zod";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { confirmBookingSchema } from "./booking.contract";
import { BookingError, confirmBooking } from "./booking.service";

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

  if (error instanceof BookingError) {
    return error.statusCode;
  }

  return 500;
};

export const confirmBookingController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new BookingError("Unauthorized", 401);
    }

    const input = confirmBookingSchema.parse(req.body);
    const booking = await confirmBooking(userId, input);

    res.status(200).json({
      success: true,
      message: "Booking confirmed successfully",
      data: {
        booking
      }
    });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};
