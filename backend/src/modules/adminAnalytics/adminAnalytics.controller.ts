import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import {
  AdminAnalyticsError,
  AnalyticsRange,
  getAnalyticsSummary,
  getBookingStatusAnalytics,
  getRevenueAnalytics,
  getSeatStatusAnalytics,
  getTopEventsAnalytics,
  getWalletFlowAnalytics
} from "./adminAnalytics.service";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
};

const getStatusCode = (error: unknown): number => {
  if (error instanceof AdminAnalyticsError) {
    return error.statusCode;
  }

  return 500;
};

const getStringParam = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") {
    return value;
  }

  return fallback;
};

export const getAnalyticsSummaryController = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const summary = await getAnalyticsSummary();

    res.status(200).json({
      success: true,
      message: "Admin analytics summary fetched successfully",
      data: summary
    });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};

export const getRevenueAnalyticsController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const range = getStringParam(req.query.range, "daily") as AnalyticsRange;
    const revenue = await getRevenueAnalytics(range);

    res.status(200).json({
      success: true,
      message: "Admin revenue analytics fetched successfully",
      data: revenue
    });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};

export const getBookingStatusAnalyticsController = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const bookingStatus = await getBookingStatusAnalytics();

    res.status(200).json({
      success: true,
      message: "Admin booking status analytics fetched successfully",
      data: bookingStatus
    });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};

export const getSeatStatusAnalyticsController = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const seatStatus = await getSeatStatusAnalytics();

    res.status(200).json({
      success: true,
      message: "Admin seat status analytics fetched successfully",
      data: seatStatus
    });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};

export const getTopEventsAnalyticsController = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const topEvents = await getTopEventsAnalytics();

    res.status(200).json({
      success: true,
      message: "Admin top events analytics fetched successfully",
      data: {
        events: topEvents
      }
    });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};

export const getWalletFlowAnalyticsController = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const walletFlow = await getWalletFlowAnalytics();

    res.status(200).json({
      success: true,
      message: "Admin wallet flow analytics fetched successfully",
      data: walletFlow
    });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};
