import { IUser } from "../db/User";
import { IUserDto } from "./interfaces";

export const toUserDto = (user: IUser): IUserDto => ({
  _id: user._id.toString(),
  email: user.email,
  fullname: user.fullname,
  username: user.username,
  followers: user.followers,
  following: user.following,
  token: user.token,
  avatarUrl: user.avatarUrl,
});
