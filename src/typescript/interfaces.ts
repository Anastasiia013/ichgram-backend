import { Request } from "express";

import { IUser } from "../db/User";

export interface IHttpError extends Error {
  status: number;
}

export interface AuthenticatedRequest extends Request {
  user: IUser;
}

export interface IUserDto {
  _id: string;
  email: string;
  fullname: string;
  username: string;
  followers: string[];
  following: string[];
  token?: string;
  avatarUrl?: string;
}
