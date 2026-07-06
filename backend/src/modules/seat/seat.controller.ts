import { Request, Response } from "express";
import { ZodError } from "zod";
import { EventError } from "../event/event.service";
import { bulkCreateSeatsSchema } from "./seat.contract";
import {
  SeatError,
  bulkCreateSeats,
  getAdminSeatsByEvent,
  getSeatsByEvent
} from "./seat.service";

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

  if (error instanceof SeatError || error instanceof EventError) {
    return error.statusCode;
  }

  return 500;
};

const getEventIdParam = (req: Request): string => {
  const eventId = req.params.eventId;

  if (typeof eventId !== "string") {
    throw new SeatError("Invalid event id", 400);
  }

  return eventId;
};

export const bulkCreateSeatsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const input = bulkCreateSeatsSchema.parse(req.body);
    const data = await bulkCreateSeats(getEventIdParam(req), input);

    res.status(201).json({
      success: true,
      message: "Seats created successfully",
      data
    });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};

export const getSeatsByEventController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const seats = await getSeatsByEvent(getEventIdParam(req));

    res.status(200).json({
      success: true,
      message: "Seats fetched successfully",
      data: {
        seats
      }
    });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};

export const getAdminSeatsByEventController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const seats = await getAdminSeatsByEvent(getEventIdParam(req));

    res.status(200).json({
      success: true,
      message: "Seats fetched successfully",
      data: {
        seats
      }
    });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};
