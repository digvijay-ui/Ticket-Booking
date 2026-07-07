import { Response } from "express";
import { ZodError } from "zod";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import {
  IdempotencyError,
  completeIdempotentRequest,
  failIdempotentRequest,
  startIdempotentRequest
} from "../idempotencyKey/idempotencyKey.service";
import { confirmBookingSchema } from "./booking.contract";
import {
  BookingError,
  cancelBooking,
  confirmBooking,
  getAdminBookings,
  getAdminTransactions,
  getMyBookings,
  refundBooking
} from "./booking.service";

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

  if (error instanceof IdempotencyError) {
    return error.statusCode;
  }

  return 500;
};

const CONFIRM_BOOKING_ENDPOINT = "POST /api/bookings/confirm";

export const confirmBookingController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  let idempotencyRecordId: string | null = null;

  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new BookingError("Unauthorized", 401);
    }

    const input = confirmBookingSchema.parse(req.body);

    const idempotencyRecord = await startIdempotentRequest({
      key: input.idempotencyKey,
      userId,
      endpoint: CONFIRM_BOOKING_ENDPOINT,
      requestBody: req.body
    });
    idempotencyRecordId = String(idempotencyRecord._id);

    const booking = await confirmBooking(userId, input);
    const responseBody = {
      success: true,
      message: "Booking confirmed successfully",
      data: {
        booking
      }
    };

    await completeIdempotentRequest({
      idempotencyRecordId,
      responseBody,
      statusCode: 200
    });

    res.status(200).json(responseBody);
  } catch (error) {
    if (error instanceof IdempotencyError && error.responseBody) {
      res.status(error.statusCode).json(error.responseBody);
      return;
    }

    const statusCode = getStatusCode(error);
    const responseBody = {
      success: false,
      message: getErrorMessage(error)
    };

    if (idempotencyRecordId) {
      await failIdempotentRequest({
        idempotencyRecordId,
        responseBody,
        statusCode
      });
    }

    res.status(statusCode).json(responseBody);
  }
};

const getStringParam = (
  value: unknown,
  fallback = ""
): string => {
  if (typeof value === "string") {
    return value;
  }

  return fallback;
};

export const getMyBookingsController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new BookingError("Unauthorized", 401);
    }

    const bookings = await getMyBookings(userId);

    res.status(200).json({
      success: true,
      message: "Bookings fetched successfully",
      data: {
        bookings
      }
    });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};

export const getAdminBookingsController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const bookings = await getAdminBookings({
      userId: getStringParam(req.query.userId),
      eventId: getStringParam(req.query.eventId),
      status: getStringParam(req.query.status) as any
    });

    res.status(200).json({
      success: true,
      message: "Admin bookings fetched successfully",
      data: {
        bookings
      }
    });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};

export const getAdminTransactionsController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const transactions = await getAdminTransactions({
      userId: getStringParam(req.query.userId),
      type: getStringParam(req.query.type) as any,
      referenceType: getStringParam(req.query.referenceType) as any
    });

    res.status(200).json({
      success: true,
      message: "Admin transactions fetched successfully",
      data: {
        transactions
      }
    });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};

export const cancelBookingController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const bookingId = getStringParam(req.params.bookingId);
    const data = await cancelBooking(bookingId);

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data
    });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};

export const refundBookingController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const bookingId = getStringParam(req.params.bookingId);
    const data = await refundBooking(bookingId);

    res.status(200).json({
      success: true,
      message: "Booking refunded successfully",
      data
    });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};
