import mongoose, { Types } from "mongoose";
import { refreshEventSeatCounts } from "../event/event.service";
import { ReservationModel } from "../reservation/reservation.model";
import { SeatModel } from "../seat/seat.model";
import { UserModel } from "../user/user.model";
import { WalletTransactionModel } from "../walletTransaction/walletTransaction.model";
import { ConfirmBookingInput } from "./booking.contract";
import {
  BookingPaymentStatus,
  BookingModel,
  BookingStatus,
  IBooking
} from "./booking.model";

export class BookingError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export interface SafeBooking {
  id: string;
  userId: string;
  eventId: string;
  seatIds: string[];
  reservationId: string;
  status: BookingStatus;
  paymentStatus: BookingPaymentStatus;
  totalAmountInPaise: number;
  walletTransactionId: string;
  idempotencyKey: string;
  createdAt: Date;
}

const toObjectId = (id: string, label: string): Types.ObjectId => {
  if (!Types.ObjectId.isValid(id)) {
    throw new BookingError(`Invalid ${label}`, 400);
  }

  return new Types.ObjectId(id);
};

const toSafeBooking = (booking: IBooking & { _id: unknown }): SafeBooking => ({
  id: String(booking._id),
  userId: String(booking.userId),
  eventId: String(booking.eventId),
  seatIds: booking.seatIds.map((seatId) => String(seatId)),
  reservationId: String(booking.reservationId),
  status: booking.status,
  paymentStatus: booking.paymentStatus,
  totalAmountInPaise: booking.totalAmountInPaise,
  walletTransactionId: String(booking.walletTransactionId),
  idempotencyKey: booking.idempotencyKey,
  createdAt: booking.createdAt
});

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: number }).code === 11000;

export const confirmBooking = async (
  userId: string,
  input: ConfirmBookingInput
): Promise<SafeBooking> => {
  const userObjectId = toObjectId(userId, "user id");
  const reservationObjectId = toObjectId(input.reservationId, "reservation id");

  const existingBooking = await BookingModel.findOne({
    userId: userObjectId,
    idempotencyKey: input.idempotencyKey
  });

  if (existingBooking) {
    return toSafeBooking(existingBooking);
  }

  const session = await mongoose.startSession();
  let committedError: BookingError | null = null;

  try {
    session.startTransaction();

    const reservation = await ReservationModel.findById(reservationObjectId).session(
      session
    );

    if (!reservation) {
      throw new BookingError("Reservation not found", 404);
    }

    if (String(reservation.userId) !== String(userObjectId)) {
      throw new BookingError("Reservation does not belong to current user", 403);
    }

    if (reservation.status !== "ACTIVE") {
      throw new BookingError("Reservation is not active", 400);
    }

    const now = new Date();

    if (reservation.expiresAt <= now) {
      await ReservationModel.updateOne(
        { _id: reservation._id },
        { $set: { status: "EXPIRED" } },
        { session }
      );

      await SeatModel.updateMany(
        {
          _id: { $in: reservation.seatIds },
          eventId: reservation.eventId,
          status: "RESERVED",
          reservedBy: userObjectId
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

      await refreshEventSeatCounts(reservation.eventId, session);
      committedError = new BookingError("Reservation expired", 400);
      await session.commitTransaction();
      throw committedError;
    }

    const seats = await SeatModel.find({
      _id: { $in: reservation.seatIds }
    }).session(session);

    if (seats.length !== reservation.seatIds.length) {
      throw new BookingError("Reserved seats are no longer valid", 400);
    }

    const seatsAreValid = seats.every(
      (seat) =>
        String(seat.eventId) === String(reservation.eventId) &&
        seat.status === "RESERVED" &&
        String(seat.reservedBy) === String(userObjectId)
    );

    if (!seatsAreValid) {
      throw new BookingError("Reserved seats are no longer valid", 400);
    }

    const totalAmountInPaise = seats.reduce(
      (total, seat) => total + seat.priceInPaise,
      0
    );

    if (!Number.isInteger(totalAmountInPaise) || totalAmountInPaise <= 0) {
      throw new BookingError("Invalid booking amount", 400);
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      {
        _id: userObjectId,
        walletBalanceInPaise: { $gte: totalAmountInPaise }
      },
      {
        $inc: {
          walletBalanceInPaise: -totalAmountInPaise
        }
      },
      {
        new: true,
        session
      }
    );

    if (!updatedUser) {
      throw new BookingError("Insufficient wallet balance", 402);
    }

    const [walletTransaction] = await WalletTransactionModel.create(
      [
        {
          userId: userObjectId,
          type: "DEBIT",
          amountInPaise: totalAmountInPaise,
          balanceAfterInPaise: updatedUser.walletBalanceInPaise,
          description: "Payment for ticket booking",
          referenceType: "BOOKING",
          referenceId: String(reservation._id),
          idempotencyKey: input.idempotencyKey
        }
      ],
      { session }
    );

    const [booking] = await BookingModel.create(
      [
        {
          userId: userObjectId,
          eventId: reservation.eventId,
          seatIds: reservation.seatIds,
          reservationId: reservation._id,
          status: "CONFIRMED",
          totalAmountInPaise,
          paymentStatus: "PAID",
          walletTransactionId: walletTransaction._id,
          idempotencyKey: input.idempotencyKey
        }
      ],
      { session }
    );

    const bookedSeatResult = await SeatModel.updateMany(
      {
        _id: { $in: reservation.seatIds },
        eventId: reservation.eventId,
        status: "RESERVED",
        reservedBy: userObjectId
      },
      {
        $set: {
          status: "BOOKED",
          bookedBy: userObjectId,
          bookingId: booking._id
        },
        $unset: {
          reservedBy: "",
          reservationExpiresAt: ""
        }
      },
      { session }
    );

    if (bookedSeatResult.modifiedCount !== reservation.seatIds.length) {
      throw new BookingError("Failed to book reserved seats", 400);
    }

    await ReservationModel.updateOne(
      { _id: reservation._id },
      { $set: { status: "CONFIRMED" } },
      { session }
    );

    await refreshEventSeatCounts(reservation.eventId, session);
    await session.commitTransaction();

    return toSafeBooking(booking);
  } catch (error) {
    if (committedError && error === committedError) {
      throw committedError;
    }

    await session.abortTransaction();

    if (isDuplicateKeyError(error)) {
      const existingBookingForReservation = await BookingModel.findOne({
        reservationId: reservationObjectId
      });

      if (existingBookingForReservation) {
        throw new BookingError(
          "Duplicate booking conflict for this reservation",
          409
        );
      }

      const existingBookingForKey = await BookingModel.findOne({
        userId: userObjectId,
        idempotencyKey: input.idempotencyKey
      });

      if (existingBookingForKey) {
        return toSafeBooking(existingBookingForKey);
      }

      throw new BookingError("Duplicate booking conflict", 409);
    }

    throw error;
  } finally {
    await session.endSession();
  }
};
