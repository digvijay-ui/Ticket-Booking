import mongoose from "mongoose";

let connectionPromise: Promise<typeof mongoose> | null = null;

export const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI or MONGO_URI is not defined");
  }

  connectionPromise ??= mongoose.connect(mongoUri).then((connection) => {
    console.log("MongoDB connected");
    return connection;
  });

  await connectionPromise;
};
