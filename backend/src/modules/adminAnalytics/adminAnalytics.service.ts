import { BookingModel } from "../booking/booking.model";
import { EventModel } from "../event/event.model";
import { SeatModel } from "../seat/seat.model";
import { WalletTransactionModel } from "../walletTransaction/walletTransaction.model";
import {
  TEST_DATA_REGEX,
  createExcludeEventIdsFilter,
  createNonTestTextFilter
} from "../../utils/adminDataFilters";

export type AnalyticsRange = "daily" | "weekly" | "monthly";

export interface AnalyticsSummary {
  totalRevenueInPaise: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  refundedBookings: number;
  refundedAmountInPaise: number;
  totalEvents: number;
  activeEvents: number;
  totalSeats: number;
  availableSeats: number;
  reservedSeats: number;
  bookedSeats: number;
}

export interface ChartSeries {
  labels: string[];
  values: number[];
}

export interface BookingStatusAnalytics {
  confirmed: number;
  cancelled: number;
  refunded: number;
}

export interface SeatStatusAnalytics {
  available: number;
  reserved: number;
  booked: number;
}

export interface TopEventAnalytics {
  eventId: string;
  title: string;
  totalBookings: number;
  revenueInPaise: number;
  bookedSeats: number;
}

export interface WalletFlowAnalytics {
  creditInPaise: number;
  debitInPaise: number;
  refundInPaise: number;
}

export class AdminAnalyticsError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

const toNumber = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const createEmptyBookingStatus = (): BookingStatusAnalytics => ({
  confirmed: 0,
  cancelled: 0,
  refunded: 0
});

const createEmptySeatStatus = (): SeatStatusAnalytics => ({
  available: 0,
  reserved: 0,
  booked: 0
});

const getDateFormat = (range: AnalyticsRange): string => {
  if (range === "weekly") {
    return "%G-W%V";
  }

  if (range === "monthly") {
    return "%Y-%m";
  }

  return "%Y-%m-%d";
};

const getTestEventIds = async () =>
  EventModel.find({
    $or: [
      { title: TEST_DATA_REGEX },
      { description: TEST_DATA_REGEX },
      { location: TEST_DATA_REGEX }
    ]
  }).distinct("_id");

const getTestBookingTransactionRefs = async (testEventIds: unknown[]) => {
  if (!testEventIds.length) {
    return {
      walletTransactionIds: [],
      referenceIds: []
    };
  }

  const bookings = await BookingModel.find({
    eventId: { $in: testEventIds }
  })
    .select("_id reservationId walletTransactionId")
    .lean();

  return {
    walletTransactionIds: bookings
      .map((booking) => booking.walletTransactionId)
      .filter(Boolean),
    referenceIds: bookings.flatMap((booking) => [
      String(booking._id),
      String(booking.reservationId)
    ])
  };
};

const createBookingAnalyticsMatch = (testEventIds: unknown[]): Record<string, unknown> => ({
  ...createExcludeEventIdsFilter(testEventIds),
  ...createNonTestTextFilter(["idempotencyKey"])
});

const createTransactionAnalyticsMatch = (): Record<string, unknown> =>
  createNonTestTextFilter(["description", "idempotencyKey", "referenceId"]);

const createEventAnalyticsMatch = (): Record<string, unknown> =>
  createNonTestTextFilter(["title", "description", "location"]);

export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  const testEventIds = await getTestEventIds();
  const bookingMatch = createBookingAnalyticsMatch(testEventIds);
  const eventMatch = createEventAnalyticsMatch();
  const seatMatch = createExcludeEventIdsFilter(testEventIds);

  const [bookingSummary, eventSummary, seatSummary] = await Promise.all([
    BookingModel.aggregate<{
      _id: null;
      totalBookings: number;
      confirmedBookings: number;
      cancelledBookings: number;
      refundedBookings: number;
      totalRevenueInPaise: number;
      refundedAmountInPaise: number;
    }>([
      { $match: bookingMatch },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          confirmedBookings: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "CONFIRMED"] },
                    { $ne: ["$paymentStatus", "REFUNDED"] }
                  ]
                },
                1,
                0
              ]
            }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] }
          },
          refundedBookings: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$status", "REFUNDED"] },
                    { $eq: ["$paymentStatus", "REFUNDED"] }
                  ]
                },
                1,
                0
              ]
            }
          },
          totalRevenueInPaise: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "CONFIRMED"] },
                    { $eq: ["$paymentStatus", "PAID"] }
                  ]
                },
                "$totalAmountInPaise",
                0
              ]
            }
          },
          refundedAmountInPaise: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", "REFUNDED"] },
                "$totalAmountInPaise",
                0
              ]
            }
          }
        }
      }
    ]),
    EventModel.aggregate<{
      _id: null;
      totalEvents: number;
      activeEvents: number;
    }>([
      { $match: eventMatch },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          activeEvents: {
            $sum: { $cond: [{ $eq: ["$status", "PUBLISHED"] }, 1, 0] }
          }
        }
      }
    ]),
    SeatModel.aggregate<{
      _id: null;
      totalSeats: number;
      availableSeats: number;
      reservedSeats: number;
      bookedSeats: number;
    }>([
      { $match: seatMatch },
      {
        $group: {
          _id: null,
          totalSeats: { $sum: 1 },
          availableSeats: {
            $sum: { $cond: [{ $eq: ["$status", "AVAILABLE"] }, 1, 0] }
          },
          reservedSeats: {
            $sum: { $cond: [{ $eq: ["$status", "RESERVED"] }, 1, 0] }
          },
          bookedSeats: {
            $sum: { $cond: [{ $eq: ["$status", "BOOKED"] }, 1, 0] }
          }
        }
      }
    ])
  ]);

  const bookings = bookingSummary[0];
  const events = eventSummary[0];
  const seats = seatSummary[0];

  return {
    totalRevenueInPaise: toNumber(bookings?.totalRevenueInPaise),
    totalBookings: toNumber(bookings?.totalBookings),
    confirmedBookings: toNumber(bookings?.confirmedBookings),
    cancelledBookings: toNumber(bookings?.cancelledBookings),
    refundedBookings: toNumber(bookings?.refundedBookings),
    refundedAmountInPaise: toNumber(bookings?.refundedAmountInPaise),
    totalEvents: toNumber(events?.totalEvents),
    activeEvents: toNumber(events?.activeEvents),
    totalSeats: toNumber(seats?.totalSeats),
    availableSeats: toNumber(seats?.availableSeats),
    reservedSeats: toNumber(seats?.reservedSeats),
    bookedSeats: toNumber(seats?.bookedSeats)
  };
};

export const getRevenueAnalytics = async (
  range: AnalyticsRange
): Promise<ChartSeries> => {
  const allowedRanges: AnalyticsRange[] = ["daily", "weekly", "monthly"];

  if (!allowedRanges.includes(range)) {
    throw new AdminAnalyticsError("range must be daily, weekly, or monthly", 400);
  }

  const testEventIds = await getTestEventIds();
  const revenue = await BookingModel.aggregate<{
    _id: string;
    revenueInPaise: number;
  }>([
    {
      $match: {
        status: "CONFIRMED",
        paymentStatus: "PAID",
        ...createBookingAnalyticsMatch(testEventIds)
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            date: "$createdAt",
            format: getDateFormat(range),
            timezone: "UTC"
          }
        },
        revenueInPaise: { $sum: "$totalAmountInPaise" }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return {
    labels: revenue.map((item) => item._id),
    values: revenue.map((item) => item.revenueInPaise)
  };
};

export const getBookingStatusAnalytics =
  async (): Promise<BookingStatusAnalytics> => {
    const testEventIds = await getTestEventIds();
    const statuses = await BookingModel.aggregate<{ _id: string; count: number }>([
      { $match: createBookingAnalyticsMatch(testEventIds) },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$paymentStatus", "REFUNDED"] },
              "REFUNDED",
              "$status"
            ]
          },
          count: { $sum: 1 }
        }
      }
    ]);

    return statuses.reduce<BookingStatusAnalytics>((acc, item) => {
      if (item._id === "CONFIRMED") acc.confirmed = item.count;
      if (item._id === "CANCELLED") acc.cancelled = item.count;
      if (item._id === "REFUNDED") acc.refunded = item.count;
      return acc;
    }, createEmptyBookingStatus());
  };

export const getSeatStatusAnalytics = async (): Promise<SeatStatusAnalytics> => {
  const testEventIds = await getTestEventIds();
  const statuses = await SeatModel.aggregate<{ _id: string; count: number }>([
    { $match: createExcludeEventIdsFilter(testEventIds) },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  return statuses.reduce<SeatStatusAnalytics>((acc, item) => {
    if (item._id === "AVAILABLE") acc.available = item.count;
    if (item._id === "RESERVED") acc.reserved = item.count;
    if (item._id === "BOOKED") acc.booked = item.count;
    return acc;
  }, createEmptySeatStatus());
};

export const getTopEventsAnalytics = async (): Promise<TopEventAnalytics[]> => {
  const testEventIds = await getTestEventIds();
  const events = await BookingModel.aggregate<TopEventAnalytics>([
    {
      $match: {
        status: "CONFIRMED",
        paymentStatus: "PAID",
        ...createBookingAnalyticsMatch(testEventIds)
      }
    },
    {
      $group: {
        _id: "$eventId",
        totalBookings: { $sum: 1 },
        revenueInPaise: { $sum: "$totalAmountInPaise" },
        bookedSeats: { $sum: { $size: "$seatIds" } }
      }
    },
    { $sort: { revenueInPaise: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "events",
        localField: "_id",
        foreignField: "_id",
        as: "event"
      }
    },
    { $unwind: { path: "$event", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        eventId: { $toString: "$_id" },
        title: { $ifNull: ["$event.title", "Deleted event"] },
        totalBookings: 1,
        revenueInPaise: 1,
        bookedSeats: 1
      }
    }
  ]);

  return events;
};

export const getWalletFlowAnalytics =
  async (): Promise<WalletFlowAnalytics> => {
    const testEventIds = await getTestEventIds();
    const testTransactionRefs = await getTestBookingTransactionRefs(testEventIds);
    const nonTestTextFilter = createTransactionAnalyticsMatch();
    const flow = await WalletTransactionModel.aggregate<{
      _id: string;
      amountInPaise: number;
    }>([
      {
        $match: {
          $and: [
            ...((nonTestTextFilter.$and as Record<string, unknown>[]) || []),
            { _id: { $nin: testTransactionRefs.walletTransactionIds } },
            { referenceId: { $nin: testTransactionRefs.referenceIds } }
          ]
        }
      },
      {
        $group: {
          _id: "$type",
          amountInPaise: { $sum: "$amountInPaise" }
        }
      }
    ]);

    return flow.reduce<WalletFlowAnalytics>(
      (acc, item) => {
        if (item._id === "CREDIT") acc.creditInPaise = item.amountInPaise;
        if (item._id === "DEBIT") acc.debitInPaise = item.amountInPaise;
        if (item._id === "REFUND") acc.refundInPaise = item.amountInPaise;
        return acc;
      },
      {
        creditInPaise: 0,
        debitInPaise: 0,
        refundInPaise: 0
      }
    );
  };
