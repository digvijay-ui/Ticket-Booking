import { Schema, Types, model } from "mongoose";

export type SeatStatus = "AVAILABLE" | "RESERVED" | "BOOKED";

export interface ISeat {
  eventId: Types.ObjectId;
  seatNumber: string;
  row: string;
  priceInPaise: number;
  status: SeatStatus;
  reservedBy?: Types.ObjectId | null;
  reservationExpiresAt?: Date | null;
  bookedBy?: Types.ObjectId | null;
  bookingId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const seatSchema = new Schema<ISeat>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },
    seatNumber: {
      type: String,
      required: true,
      trim: true
    },
    row: {
      type: String,
      required: true,
      trim: true
    },
    priceInPaise: {
      type: Number,
      required: true,
      min: 1
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "RESERVED", "BOOKED"],
      default: "AVAILABLE"
    },
    reservedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    reservationExpiresAt: {
      type: Date,
      default: null
    },
    bookedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      default: null
    }
  },
  {
    timestamps: true
  }
);

seatSchema.index({ eventId: 1, seatNumber: 1 }, { unique: true });
seatSchema.index({ eventId: 1, status: 1 });
seatSchema.index({ reservationExpiresAt: 1 });

export const SeatModel = model<ISeat>("Seat", seatSchema);
