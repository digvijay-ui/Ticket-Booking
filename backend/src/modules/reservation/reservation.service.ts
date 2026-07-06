import mongoose, { Types } from "mongoose";
import { EventModel } from "../event/event.model";
import { EventError, refreshEventSeatCounts } from "../event/event.service";
import { SeatModel } from "../seat/seat.model";
import { ReserveSeatsInput } from "./reservation.contract";
import {
  IReservation,
  ReservationModel,
  ReservationStatus
} from "./reservation.model";

const RESERVATION_EXPIRY_MINUTES = 5;

export class ReservationError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export interface SafeReservation {
  id: string;
  eventId: string;
  seatIds: string[];
  status: ReservationStatus;
  totalAmountInPaise: number;
  expiresAt: Date;
}

const toObjectId = (id: string, label: string): Types.ObjectId => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ReservationError(`Invalid ${label}`, 400);
  }

  return new Types.ObjectId(id);
};

const toSafeReservation = (
  reservation: IReservation & { _id: unknown }
): SafeReservation => ({
  id: String(reservation._id),
  eventId: String(reservation.eventId),
  seatIds: reservation.seatIds.map((seatId) => String(seatId)),
  status: reservation.status,
  totalAmountInPaise: reservation.totalAmountInPaise,
  expiresAt: reservation.expiresAt
});

export const reserveSeats = async (
  userId: string,
  input: ReserveSeatsInput
): Promise<SafeReservation> => {
  const userObjectId = toObjectId(userId, "user id");
  const eventObjectId = toObjectId(input.eventId, "event id");
  const seatObjectIds = input.seatIds.map((seatId) =>
    toObjectId(seatId, "seat id")
  );

  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + RESERVATION_EXPIRY_MINUTES * 60 * 1000
  );
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const event = await EventModel.findById(eventObjectId).session(session);

    if (!event) {
      throw new EventError("Event not found", 404);
    }

    if (event.status !== "PUBLISHED") {
      throw new EventError("Event is not published", 400);
    }

    await SeatModel.updateMany(
      {
        eventId: eventObjectId,
        status: "RESERVED",
        reservationExpiresAt: { $lt: now }
      },
      {
        $set: {
          status: "AVAILABLE",
          reservedBy: null,
          reservationExpiresAt: null
        }
      },
      { session }
    );

    await ReservationModel.updateMany(
      {
        eventId: eventObjectId,
        status: "ACTIVE",
        expiresAt: { $lt: now }
      },
      {
        $set: {
          status: "EXPIRED"
        }
      },
      { session }
    );

    const requestedSeats = await SeatModel.find({
      _id: { $in: seatObjectIds }
    }).session(session);

    if (requestedSeats.length !== seatObjectIds.length) {
      throw new ReservationError("One or more seats not found", 404);
    }

    const seatFromDifferentEvent = requestedSeats.find(
      (seat) => String(seat.eventId) !== String(eventObjectId)
    );

    if (seatFromDifferentEvent) {
      throw new ReservationError("All seats must belong to the selected event", 400);
    }

    const totalAmountInPaise = requestedSeats.reduce(
      (total, seat) => total + seat.priceInPaise,
      0
    );

    const reserveResult = await SeatModel.updateMany(
      {
        _id: { $in: seatObjectIds },
        eventId: eventObjectId,
        $or: [
          { status: "AVAILABLE" },
          {
            status: "RESERVED",
            reservationExpiresAt: { $lt: now }
          }
        ]
      },
      {
        $set: {
          status: "RESERVED",
          reservedBy: userObjectId,
          reservationExpiresAt: expiresAt
        }
      },
      { session }
    );

    if (reserveResult.modifiedCount !== seatObjectIds.length) {
      throw new ReservationError("Some seats are no longer available", 400);
    }

    const [reservation] = await ReservationModel.create(
      [
        {
          userId: userObjectId,
          eventId: eventObjectId,
          seatIds: seatObjectIds,
          status: "ACTIVE",
          totalAmountInPaise,
          expiresAt
        }
      ],
      { session }
    );

    await refreshEventSeatCounts(eventObjectId, session);
    await session.commitTransaction();

    return toSafeReservation(reservation);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};
