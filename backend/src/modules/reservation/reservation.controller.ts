import { Response } from "express";
import { ZodError } from "zod";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { EventError } from "../event/event.service";
import { reserveSeatsSchema } from "./reservation.contract";
import { ReservationError, reserveSeats } from "./reservation.service";

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

  if (error instanceof ReservationError || error instanceof EventError) {
    return error.statusCode;
  }

  return 500;
};

export const reserveSeatsController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new ReservationError("Unauthorized", 401);
    }

    const input = reserveSeatsSchema.parse(req.body);
    const reservation = await reserveSeats(userId, input);

    res.status(201).json({
      success: true,
      message: "Seats reserved successfully",
      data: {
        reservation
      }
    });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};
