import { IUser } from "../db/User";

declare global {
  namespace Express {
    interface Request {
      user: IUser;
    }
  }
}
