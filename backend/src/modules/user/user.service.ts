import bcrypt from "bcrypt";
import { generateToken } from "../../utils/jwt";
import { LoginInput, SignupInput } from "./user.contract";
import { IUser, UserModel } from "./user.model";

const SALT_ROUNDS = 10;

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: IUser["role"];
  walletBalanceInPaise: number;
}

const toSafeUser = (user: IUser & { _id: unknown }): SafeUser => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  walletBalanceInPaise: user.walletBalanceInPaise
});

const loginWithRoleCheck = async (
  input: LoginInput,
  requiredRole?: IUser["role"]
): Promise<{ user: SafeUser; token: string }> => {
  const user = await UserModel.findOne({ email: input.email.toLowerCase() }).select(
    "+passwordHash"
  );

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  if (requiredRole && user.role !== requiredRole) {
    throw new AppError("Only admin users can login here", 403);
  }

  const safeUser = toSafeUser(user);
  const token = generateToken({ userId: safeUser.id, role: safeUser.role });

  return {
    user: safeUser,
    token
  };
};

export const signupUser = async (
  input: SignupInput
): Promise<{ user: SafeUser; token: string }> => {
  const email = input.email.toLowerCase();
  const existingUser = await UserModel.findOne({ email });

  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await UserModel.create({
    name: input.name,
    email,
    passwordHash,
    role: "USER",
    walletBalanceInPaise: 0
  });

  const safeUser = toSafeUser(user);
  const token = generateToken({ userId: safeUser.id, role: safeUser.role });

  return {
    user: safeUser,
    token
  };
};

export const signupFirstAdmin = async (
  input: SignupInput
): Promise<{ user: SafeUser; token: string }> => {
  const existingAdmin = await UserModel.findOne({ role: "ADMIN" });

  if (existingAdmin) {
    throw new AppError("Admin account already exists. Please login as admin.", 409);
  }

  const email = input.email.toLowerCase();
  const existingUser = await UserModel.findOne({ email });

  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await UserModel.create({
    name: input.name,
    email,
    passwordHash,
    role: "ADMIN",
    walletBalanceInPaise: 0
  });

  const safeUser = toSafeUser(user);
  const token = generateToken({ userId: safeUser.id, role: safeUser.role });

  return {
    user: safeUser,
    token
  };
};

export const createAdminUser = async (input: SignupInput): Promise<SafeUser> => {
  const email = input.email.toLowerCase();
  const existingUser = await UserModel.findOne({ email });

  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await UserModel.create({
    name: input.name,
    email,
    passwordHash,
    role: "ADMIN",
    walletBalanceInPaise: 0
  });

  return toSafeUser(user);
};

export const loginUser = async (
  input: LoginInput
): Promise<{ user: SafeUser; token: string }> => loginWithRoleCheck(input);

export const adminLogin = async (
  input: LoginInput
): Promise<{ user: SafeUser; token: string }> => loginWithRoleCheck(input, "ADMIN");

export const getCurrentUser = async (userId: string): Promise<SafeUser> => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError("User not found", 401);
  }

  return toSafeUser(user);
};
