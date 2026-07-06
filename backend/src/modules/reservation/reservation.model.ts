import { Schema, Types, model } from "mongoose";

export type ReservationStatus = "ACTIVE" | "EXPIRED" | "CONFIRMED" | "CANCELLED";

export interface IReservation {
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  seatIds: Types.ObjectId[];
  status: ReservationStatus;
  totalAmountInPaise: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reservationSchema = new Schema<IReservation>(
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
    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "CONFIRMED", "CANCELLED"],
      default: "ACTIVE"
    },
    totalAmountInPaise: {
      type: Number,
      required: true,
      min: 1
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

reservationSchema.index({ userId: 1, createdAt: -1 });
reservationSchema.index({ eventId: 1, status: 1 });
reservationSchema.index({ status: 1, expiresAt: 1 });
reservationSchema.index({ seatIds: 1 });

export const ReservationModel = model<IReservation>(
  "Reservation",
  reservationSchema
);
