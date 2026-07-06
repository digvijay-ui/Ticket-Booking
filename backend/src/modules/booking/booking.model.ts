import { Schema, Types, model } from "mongoose";

export type BookingStatus = "CONFIRMED" | "CANCELLED";
export type BookingPaymentStatus = "PAID" | "REFUNDED";

export interface IBooking {
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  seatIds: Types.ObjectId[];
  reservationId: Types.ObjectId;
  status: BookingStatus;
  totalAmountInPaise: number;
  paymentStatus: BookingPaymentStatus;
  walletTransactionId: Types.ObjectId;
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },
    seatIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Seat",
        required: true
      }
    ],
    reservationId: {
      type: Schema.Types.ObjectId,
      ref: "Reservation",
      required: true
    },
    status: {
      type: String,
      enum: ["CONFIRMED", "CANCELLED"],
      default: "CONFIRMED"
    },
    totalAmountInPaise: {
      type: Number,
      required: true,
      min: 1
    },
    paymentStatus: {
      type: String,
      enum: ["PAID", "REFUNDED"],
      default: "PAID"
    },
    walletTransactionId: {
      type: Schema.Types.ObjectId,
      ref: "WalletTransaction",
      required: true
    },
    idempotencyKey: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ eventId: 1, status: 1 });
bookingSchema.index({ reservationId: 1 }, { unique: true });
bookingSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true });
bookingSchema.index({ walletTransactionId: 1 });

export const BookingModel = model<IBooking>("Booking", bookingSchema);
