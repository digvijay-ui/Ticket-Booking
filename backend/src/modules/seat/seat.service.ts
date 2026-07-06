import mongoose, { Types } from "mongoose";
import {
  EventError,
  EventSeatCounts,
  refreshEventSeatCounts
} from "../event/event.service";
import { EventModel } from "../event/event.model";
import { ReservationModel } from "../reservation/reservation.model";
import { BulkCreateSeatsInput } from "./seat.contract";
import { ISeat, SeatModel, SeatStatus } from "./seat.model";

export class SeatError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export interface SafeSeat {
  id: string;
  eventId: string;
  seatNumber: string;
  row: string;
  priceInPaise: number;
  status: SeatStatus;
  reservedBy?: string | null;
  reservationExpiresAt?: Date | null;
  bookedBy?: string | null;
  bookingId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const toObjectId = (id: string, label: string): Types.ObjectId => {
  if (!Types.ObjectId.isValid(id)) {
    throw new SeatError(`Invalid ${label}`, 400);
  }

  return new Types.ObjectId(id);
};

const toSafeSeat = (seat: ISeat & { _id: unknown }): SafeSeat => ({
  id: String(seat._id),
  eventId: String(seat.eventId),
  seatNumber: seat.seatNumber,
  row: seat.row,
  priceInPaise: seat.priceInPaise,
  status: seat.status,
  reservedBy: seat.reservedBy ? String(seat.reservedBy) : null,
  reservationExpiresAt: seat.reservationExpiresAt || null,
  bookedBy: seat.bookedBy ? String(seat.bookedBy) : null,
  bookingId: seat.bookingId ? String(seat.bookingId) : null,
  createdAt: seat.createdAt,
  updatedAt: seat.updatedAt
});

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: number }).code === 11000;

const sortSeats = (seats: SafeSeat[]): SafeSeat[] =>
  seats.sort((firstSeat, secondSeat) => {
    const rowCompare = firstSeat.row.localeCompare(secondSeat.row, undefined, {
      numeric: true
    });

    if (rowCompare !== 0) {
      return rowCompare;
    }

    return firstSeat.seatNumber.localeCompare(secondSeat.seatNumber, undefined, {
      numeric: true
    });
  });

const releaseExpiredReservations = async (
  eventId: Types.ObjectId
): Promise<void> => {
  const now = new Date();

  await SeatModel.updateMany(
    {
      eventId,
      status: "RESERVED",
      reservationExpiresAt: { $lt: now }
    },
    {
      $set: {
        status: "AVAILABLE",
        reservedBy: null,
        reservationExpiresAt: null
      }
    }
  );

  await ReservationModel.updateMany(
    {
      eventId,
      status: "ACTIVE",
      expiresAt: { $lt: now }
    },
    {
      $set: {
        status: "EXPIRED"
      }
    }
  );
};

export const bulkCreateSeats = async (
  eventId: string,
  input: BulkCreateSeatsInput
): Promise<{ createdCount: number; eventSeatCounts: EventSeatCounts }> => {
  const eventObjectId = toObjectId(eventId, "event id");
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const event = await EventModel.findById(eventObjectId).session(session);

    if (!event) {
      throw new EventError("Event not found", 404);
    }

    if (event.status === "CANCELLED") {
      throw new SeatError("Cannot create seats for cancelled event", 400);
    }

    const priceInPaise = input.priceInPaise || event.seatPriceInPaise;
    const seats = input.rows.flatMap((row) =>
      Array.from({ length: input.seatsPerRow }, (_, index) => ({
        eventId: eventObjectId,
        row,
        seatNumber: `${row}${index + 1}`,
        priceInPaise,
        status: "AVAILABLE" as const
      }))
    );

    await SeatModel.insertMany(seats, { session, ordered: true });
    const eventSeatCounts = await refreshEventSeatCounts(eventObjectId, session);

    await session.commitTransaction();

    return {
      createdCount: seats.length,
      eventSeatCounts
    };
  } catch (error) {
    await session.abortTransaction();

    if (isDuplicateKeyError(error)) {
      throw new SeatError("Duplicate seats already exist for this event", 409);
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

export const getSeatsByEvent = async (eventId: string): Promise<SafeSeat[]> => {
  const eventObjectId = toObjectId(eventId, "event id");
  const event = await EventModel.findOne({
    _id: eventObjectId,
    status: { $ne: "CANCELLED" }
  });

  if (!event) {
    throw new EventError("Event not found", 404);
  }

  await releaseExpiredReservations(eventObjectId);
  await refreshEventSeatCounts(eventObjectId);

  const seats = await SeatModel.find({ eventId: eventObjectId }).lean();

  return sortSeats(seats.map((seat) => toSafeSeat(seat)));
};

export const getAdminSeatsByEvent = async (
  eventId: string
): Promise<SafeSeat[]> => {
  const eventObjectId = toObjectId(eventId, "event id");
  const event = await EventModel.findById(eventObjectId);

  if (!event) {
    throw new EventError("Event not found", 404);
  }

  await releaseExpiredReservations(eventObjectId);
  await refreshEventSeatCounts(eventObjectId);

  const seats = await SeatModel.find({ eventId: eventObjectId }).lean();

  return sortSeats(seats.map((seat) => toSafeSeat(seat)));
};
