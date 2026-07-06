import { Schema, Types, model } from "mongoose";

export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";

export interface IEvent {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  status: EventStatus;
  seatPriceInPaise: number;
  createdBy: Types.ObjectId;
  totalSeats: number;
  availableSeats: number;
  bookedSeats: number;
  reservedSeats: number;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"],
      default: "DRAFT"
    },
    seatPriceInPaise: {
      type: Number,
      required: true,
      min: 1
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    totalSeats: {
      type: Number,
      default: 0
    },
    availableSeats: {
      type: Number,
      default: 0
    },
    bookedSeats: {
      type: Number,
      default: 0
    },
    reservedSeats: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

eventSchema.index({ status: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ createdBy: 1 });

export const EventModel = model<IEvent>("Event", eventSchema);
