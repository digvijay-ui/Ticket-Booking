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

export interface BookingListFilters {
  userId?: string;
  eventId?: string;
  status?: BookingStatus;
}

export interface TransactionListFilters {
  userId?: string;
  type?: "CREDIT" | "DEBIT" | "REFUND";
  referenceType?: "ADD_MONEY" | "BOOKING" | "REFUND";
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

const toObjectIdIfPresent = (
  id: string | undefined,
  label: string
): Types.ObjectId | undefined => {
  if (!id) {
    return undefined;
  }

  return toObjectId(id, label);
};

const sanitizePopulatedBooking = (booking: Record<string, any>): Record<string, any> => ({
  id: String(booking._id),
  userId: typeof booking.userId === "object" && booking.userId !== null
    ? {
        id: String(booking.userId._id),
        name: booking.userId.name,
        email: booking.userId.email,
        role: booking.userId.role
      }
    : String(booking.userId),
  event: booking.eventId && typeof booking.eventId === "object"
    ? {
        id: String(booking.eventId._id),
        title: booking.eventId.title,
        location: booking.eventId.location,
        startDate: booking.eventId.startDate,
        endDate: booking.eventId.endDate,
        status: booking.eventId.status
      }
    : String(booking.eventId),
  seats: Array.isArray(booking.seatIds)
    ? booking.seatIds.map((seat: Record<string, any>) =>
        seat && typeof seat === "object"
          ? {
              id: String(seat._id),
              seatNumber: seat.seatNumber,
              row: seat.row,
              priceInPaise: seat.priceInPaise,
              status: seat.status
            }
          : String(seat)
      )
    : [],
  reservationId: String(booking.reservationId),
  status: booking.status,
  paymentStatus: booking.paymentStatus,
  totalAmountInPaise: booking.totalAmountInPaise,
  walletTransactionId: String(booking.walletTransactionId),
  idempotencyKey: booking.idempotencyKey,
  createdAt: booking.createdAt,
  updatedAt: booking.updatedAt
});

const sanitizeTransaction = (
  transaction: Record<string, any>
): Record<string, any> => ({
  id: String(transaction._id),
  userId:
    transaction.userId && typeof transaction.userId === "object"
      ? {
          id: String(transaction.userId._id),
          name: transaction.userId.name,
          email: transaction.userId.email,
          role: transaction.userId.role
        }
      : String(transaction.userId),
  type: transaction.type,
  amountInPaise: transaction.amountInPaise,
  balanceAfterInPaise: transaction.balanceAfterInPaise,
  description: transaction.description,
  referenceType: transaction.referenceType,
  referenceId: transaction.referenceId,
  idempotencyKey: transaction.idempotencyKey,
  createdAt: transaction.createdAt,
  updatedAt: transaction.updatedAt
});

const createRefundTransaction = async (
  booking: IBooking & { _id: unknown },
  description: string,
  session: mongoose.ClientSession
): Promise<Record<string, any>> => {
  const updatedUser = await UserModel.findByIdAndUpdate(
    booking.userId,
    {
      $inc: {
        walletBalanceInPaise: booking.totalAmountInPaise
      }
    },
    {
      new: true,
      session
    }
  );

  if (!updatedUser) {
    throw new BookingError("User not found", 404);
  }

  const [refundTransaction] = await WalletTransactionModel.create(
    [
      {
        userId: booking.userId,
        type: "REFUND",
        amountInPaise: booking.totalAmountInPaise,
        balanceAfterInPaise: updatedUser.walletBalanceInPaise,
        description,
        referenceType: "REFUND",
        referenceId: String(booking._id)
      }
    ],
    { session }
  );

  return sanitizeTransaction(refundTransaction.toObject());
};

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

export const getMyBookings = async (
  userId: string
): Promise<Record<string, any>[]> => {
  const userObjectId = toObjectId(userId, "user id");
  const bookings = await BookingModel.find({ userId: userObjectId })
    .populate("eventId", "title location startDate endDate status")
    .populate("seatIds", "seatNumber row priceInPaise status")
    .sort({ createdAt: -1 })
    .lean();

  return bookings.map((booking) => sanitizePopulatedBooking(booking));
};

export const getAdminBookings = async (
  filters: BookingListFilters
): Promise<Record<string, any>[]> => {
  const query: Record<string, unknown> = {};

  const userObjectId = toObjectIdIfPresent(filters.userId, "user id");
  const eventObjectId = toObjectIdIfPresent(filters.eventId, "event id");

  if (userObjectId) query.userId = userObjectId;
  if (eventObjectId) query.eventId = eventObjectId;
  if (filters.status) query.status = filters.status;

  const bookings = await BookingModel.find(query)
    .populate("userId", "name email role")
    .populate("eventId", "title location startDate endDate status")
    .populate("seatIds", "seatNumber row priceInPaise status")
    .sort({ createdAt: -1 })
    .lean();

  return bookings.map((booking) => sanitizePopulatedBooking(booking));
};

export const getAdminTransactions = async (
  filters: TransactionListFilters
): Promise<Record<string, any>[]> => {
  const query: Record<string, unknown> = {};
  const userObjectId = toObjectIdIfPresent(filters.userId, "user id");

  if (userObjectId) query.userId = userObjectId;
  if (filters.type) query.type = filters.type;
  if (filters.referenceType) query.referenceType = filters.referenceType;

  const transactions = await WalletTransactionModel.find(query)
    .populate("userId", "name email role")
    .sort({ createdAt: -1 })
    .lean();

  return transactions.map((transaction) => sanitizeTransaction(transaction));
};

export const cancelBooking = async (
  bookingId: string
): Promise<{ booking: SafeBooking; refundTransaction: Record<string, any> }> => {
  const bookingObjectId = toObjectId(bookingId, "booking id");
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const booking = await BookingModel.findById(bookingObjectId).session(session);

    if (!booking) {
      throw new BookingError("Booking not found", 404);
    }

    if (booking.status === "CANCELLED") {
      throw new BookingError("Booking already cancelled", 409);
    }

    if (booking.paymentStatus === "REFUNDED") {
      throw new BookingError("Booking already refunded", 409);
    }

    const refundTransaction = await createRefundTransaction(
      booking,
      "Refund for cancelled booking",
      session
    );

    booking.status = "CANCELLED";
    booking.paymentStatus = "REFUNDED";
    await booking.save({ session });

    await SeatModel.updateMany(
      {
        _id: { $in: booking.seatIds },
        bookingId: booking._id,
        status: "BOOKED"
      },
      {
        $set: {
          status: "AVAILABLE",
          bookedBy: null,
          bookingId: null,
          reservedBy: null,
          reservationExpiresAt: null
        }
      },
      { session }
    );

    await refreshEventSeatCounts(booking.eventId, session);
    await session.commitTransaction();

    return {
      booking: toSafeBooking(booking),
      refundTransaction
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const refundBooking = async (
  bookingId: string
): Promise<{ booking: SafeBooking; refundTransaction: Record<string, any> }> => {
  const bookingObjectId = toObjectId(bookingId, "booking id");
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const booking = await BookingModel.findById(bookingObjectId).session(session);

    if (!booking) {
      throw new BookingError("Booking not found", 404);
    }

    if (booking.paymentStatus === "REFUNDED") {
      throw new BookingError("Booking already refunded", 409);
    }

    const refundTransaction = await createRefundTransaction(
      booking,
      "Refund for ticket booking",
      session
    );

    booking.status = "REFUNDED";
    booking.paymentStatus = "REFUNDED";
    await booking.save({ session });
    await session.commitTransaction();

    return {
      booking: toSafeBooking(booking),
      refundTransaction
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};
