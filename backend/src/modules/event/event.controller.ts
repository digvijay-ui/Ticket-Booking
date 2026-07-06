import { Request, Response } from "express";
import { ZodError } from "zod";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { createEventSchema, updateEventSchema } from "./event.contract";
import {
  EventError,
  cancelEvent,
  createEvent,
  getEventById,
  listPublishedEvents,
  updateEvent
} from "./event.service";

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

  if (error instanceof EventError) {
    return error.statusCode;
  }

  return 500;
};

const getEventIdParam = (req: Request): string => {
  const eventId = req.params.eventId;

  if (typeof eventId !== "string") {
    throw new EventError("Invalid event id", 400);
  }

  return eventId;
};

export const createEventController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const adminUserId = req.user?.id;

    if (!adminUserId) {
      throw new EventError("Unauthorized", 401);
    }

    const input = createEventSchema.parse(req.body);
    const event = await createEvent(adminUserId, input);

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: {
        event
      }
    });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};

export const updateEventController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const input = updateEventSchema.parse(req.body);
    const event = await updateEvent(getEventIdParam(req), input);

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: {
        event
      }
    });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};

export const cancelEventController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const event = await cancelEvent(getEventIdParam(req));

    res.status(200).json({
      success: true,
      message: "Event cancelled successfully",
      data: {
        event
      }
    });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};

export const listEventsController = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const events = await listPublishedEvents();

    res.status(200).json({
      success: true,
      message: "Events fetched successfully",
      data: {
        events
      }
    });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};

export const getEventController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const event = await getEventById(getEventIdParam(req));

    res.status(200).json({
      success: true,
      message: "Event fetched successfully",
      data: {
        event
      }
    });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};
