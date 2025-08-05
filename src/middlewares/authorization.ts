import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../db/User";
import HttpException from "../utils/HttpExeption";

const JWT_SECRET = process.env.JWT_SECRET as string;

interface JwtPayload {
  id: string;
  email: string;
  username: string;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { authorization } = req.headers;

  if (!authorization) {
    return next(HttpException(401, "Authorization header missing"));
  }

  const [bearer, token] = authorization.split(" ");

  if (bearer !== "Bearer" || !token) {
    return next(HttpException(401, "Invalid authorization format"));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded !== "object" || decoded === null || !("id" in decoded)) {
      return next(HttpException(401, "Invalid token payload"));
    }

    const payload = decoded as JwtPayload;

    const user = await User.findById(payload.id);

    if (!user || !user.token || user.token !== token) {
      return next(HttpException(401, "User not found or token mismatch"));
    }

    req.user = user;
    next();
  } catch (error: any) {
    return next(HttpException(401, error.message || "Unauthorized"));
  }
};