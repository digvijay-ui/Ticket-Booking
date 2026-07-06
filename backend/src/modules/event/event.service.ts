import { ClientSession, Types } from "mongoose";
import { SeatModel } from "../seat/seat.model";
import { CreateEventInput, UpdateEventInput } from "./event.contract";
import { EventModel, EventStatus, IEvent } from "./event.model";

export class EventError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export interface SafeEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  status: EventStatus;
  seatPriceInPaise: number;
  createdBy: string;
  totalSeats: number;
  availableSeats: number;
  bookedSeats: number;
  reservedSeats: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventSeatCounts {
  totalSeats: number;
  availableSeats: number;
  reservedSeats: number;
  bookedSeats: number;
}

const toObjectId = (id: string, label: string): Types.ObjectId => {
  if (!Types.ObjectId.isValid(id)) {
    throw new EventError(`Invalid ${label}`, 400);
  }

  return new Types.ObjectId(id);
};

export const toSafeEvent = (event: IEvent & { _id: unknown }): SafeEvent => ({
  id: String(event._id),
  title: event.title,
  description: event.description,
  location: event.location,
  startDate: event.startDate,
  endDate: event.endDate,
  status: event.status,
  seatPriceInPaise: event.seatPriceInPaise,
  createdBy: String(event.createdBy),
  totalSeats: event.totalSeats,
  availableSeats: event.availableSeats,
  bookedSeats: event.bookedSeats,
  reservedSeats: event.reservedSeats,
  createdAt: event.createdAt,
  updatedAt: event.updatedAt
});

const validateEventDateRange = (startDate: Date, endDate: Date): void => {
  if (endDate <= startDate) {
    throw new EventError("endDate must be after startDate", 400);
  }
};

export const createEvent = async (
  adminUserId: string,
  input: CreateEventInput
): Promise<SafeEvent> => {
  const adminObjectId = toObjectId(adminUserId, "admin user id");

  const event = await EventModel.create({
    title: input.title,
    description: input.description,
    location: input.location,
    startDate: input.startDate,
    endDate: input.endDate,
    status: input.status || "DRAFT",
    seatPriceInPaise: input.seatPriceInPaise,
    createdBy: adminObjectId,
    totalSeats: 0,
    availableSeats: 0,
    bookedSeats: 0,
    reservedSeats: 0
  });

  return toSafeEvent(event);
};

export const updateEvent = async (
  eventId: string,
  input: UpdateEventInput
): Promise<SafeEvent> => {
  const eventObjectId = toObjectId(eventId, "event id");
  const event = await EventModel.findById(eventObjectId);

  if (!event) {
    throw new EventError("Event not found", 404);
  }

  const nextStartDate = input.startDate || event.startDate;
  const nextEndDate = input.endDate || event.endDate;
  validateEventDateRange(nextStartDate, nextEndDate);

  if (input.title !== undefined) event.title = input.title;
  if (input.description !== undefined) event.description = input.description;
  if (input.location !== undefined) event.location = input.location;
  if (input.startDate !== undefined) event.startDate = input.startDate;
  if (input.endDate !== undefined) event.endDate = input.endDate;
  if (input.seatPriceInPaise !== undefined) {
    event.seatPriceInPaise = input.seatPriceInPaise;
  }
  if (input.status !== undefined) event.status = input.status;

  await event.save();

  return toSafeEvent(event);
};

export const cancelEvent = async (eventId: string): Promise<SafeEvent> => {
  const eventObjectId = toObjectId(eventId, "event id");
  const event = await EventModel.findByIdAndUpdate(
    eventObjectId,
    { status: "CANCELLED" },
    { new: true }
  );

  if (!event) {
    throw new EventError("Event not found", 404);
  }

  return toSafeEvent(event);
};

export const listPublishedEvents = async (): Promise<SafeEvent[]> => {
  const events = await EventModel.find({ status: "PUBLISHED" }).sort({
    startDate: 1
  });

  return events.map((event) => toSafeEvent(event));
};

export const getEventById = async (eventId: string): Promise<SafeEvent> => {
  const eventObjectId = toObjectId(eventId, "event id");
  const event = await EventModel.findOne({
    _id: eventObjectId,
    status: { $ne: "CANCELLED" }
  });

  if (!event) {
    throw new EventError("Event not found", 404);
  }

  return toSafeEvent(event);
};

export const refreshEventSeatCounts = async (
  eventId: string | Types.ObjectId,
  session?: ClientSession
): Promise<EventSeatCounts> => {
  const eventObjectId =
    typeof eventId === "string" ? toObjectId(eventId, "event id") : eventId;

  const counts = await SeatModel.aggregate<{ _id: string; count: number }>([
    { $match: { eventId: eventObjectId } },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]).session(session || null);

  const countByStatus = counts.reduce<Record<string, number>>((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  const eventSeatCounts: EventSeatCounts = {
    totalSeats: counts.reduce((total, item) => total + item.count, 0),
    availableSeats: countByStatus.AVAILABLE || 0,
    reservedSeats: countByStatus.RESERVED || 0,
    bookedSeats: countByStatus.BOOKED || 0
  };

  const event = await EventModel.findByIdAndUpdate(eventObjectId, eventSeatCounts, {
    new: true,
    session
  });

  if (!event) {
    throw new EventError("Event not found", 404);
  }

  return eventSeatCounts;
};
