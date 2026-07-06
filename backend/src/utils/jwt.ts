import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

export interface TokenPayload {
  userId: string;
  role: "USER" | "ADMIN";
}

const getJwtSecret = (): string => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwtSecret;
};

export const generateToken = (payload: TokenPayload): string => {
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];
  const options: SignOptions = {
    expiresIn
  };

  return jwt.sign(payload, getJwtSecret(), options);
};

export const verifyToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;

  if (typeof decoded.userId !== "string") {
    throw new Error("Invalid token payload");
  }

  if (decoded.role !== "USER" && decoded.role !== "ADMIN") {
    throw new Error("Invalid token payload");
  }

  return {
    userId: decoded.userId,
    role: decoded.role
  };
};
