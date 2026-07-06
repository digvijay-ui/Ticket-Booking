import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI or MONGO_URI is not defined");
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
};
