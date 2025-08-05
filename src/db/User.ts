import { Schema, model, Document } from "mongoose";
import { emailValidation } from "../constants/users.constants";

export interface IUser extends Document {
  _id: string;
  email: string;
  fullname: string;
  username: string;
  password: string;
  token?: string;
  verify: boolean;
  verificationCode?: string;

  bio?: string;
  link?: string;
  avatarUrl?: string;

  followers: string[];
  following: string[];
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      unique: true,
      match: emailValidation.value,
      required: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    token: String,
    verificationCode: String,
    verify: {
      type: Boolean,
      default: false,
      required: true,
    },

    bio: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const User = model<IUser>("User", userSchema);

export default User;
