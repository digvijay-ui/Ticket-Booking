import dotenv from "dotenv";
import { app } from "./app";
import { connectDB } from "./config/db";

dotenv.config();

export default async function handler(
  req: Parameters<typeof app>[0],
  res: Parameters<typeof app>[1]
): Promise<void> {
  await connectDB();
  app(req, res);
}
