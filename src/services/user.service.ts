import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import User from "../db/User";
import { Types } from "mongoose";

import sendEmailWitMailgun from "../utils/sendEmailWithMailgun";
import HttpExeption from "../utils/HttpExeption";
import { generateVerificationCode } from "../utils/generateVerificationCode";
import { createNotification } from "./notification.service";

const { FRONTEND_URL } = process.env;

interface RegisterUser {
  email: string;
  fullname: string;
  username: string;
  password: string;
}

export const registerUser = async (data: RegisterUser) => {
  const { email, fullname, username, password } = data;

  const userByEmail = await User.findOne({ email });
  if (userByEmail)
    throw HttpExeption(409, `Email ${email} is already registered`);

  const userByUsername = await User.findOne({ username });
  if (userByUsername)
    throw HttpExeption(409, `Username ${username} is already taken`);

  const hashPassword = await bcrypt.hash(password, 10);
  const verificationCode = nanoid();

  const newUser = await User.create({
    ...data,
    password: hashPassword,
    verificationCode,
  });

  const verifyEmail = {
    to: [email],
    subject: "Verify your email on Ichgram",
    html: `<a href="${FRONTEND_URL}?verificationCode=${verificationCode}" target="_blank">Click to verify your email adress on Ichgram</a>`,
  };
  await sendEmailWitMailgun(verifyEmail);

  return newUser;
};

export const checkEmailExists = async (email: string): Promise<boolean> => {
  const user = await User.findOne({ email });
  return !!user;
};

export const checkUsernameExists = async (
  username: string
): Promise<boolean> => {
  const user = await User.findOne({ username });
  return !!user;
};

export const verify = async (code: string) => {
  const user = await User.findOne({ verificationCode: code });

  if (!user) throw HttpExeption(401, "Email already verified or not found");

  user.verificationCode = "";
  user.verify = true;
  await user.save();
};

export const sendPasswordResetLink = async (identifier: string): Promise<void> => {
  if (!identifier) {
    throw HttpExeption(400, "Email или username обязателен");
  }

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });

  if (!user) {
    throw HttpExeption(404, `User with identifier "${identifier}" not found`);
  }

  const verificationCode = generateVerificationCode();
  user.verificationCode = verificationCode;
  await user.save();

  const emailData = {
    to: [user.email],
    subject: "Reset your Ichgram password",
    html: `<p>Click the link below to reset your password:</p>
           <a href="${FRONTEND_URL}/reset-password?verificationCode=${verificationCode}" target="_blank">
             Reset Password
           </a>`,
  };

  await sendEmailWitMailgun(emailData);
};


export const resetPasswordByCode = async (
  verificationCode: string,
  newPassword: string
): Promise<void> => {
  const user = await User.findOne({ verificationCode });

  if (!user) {
    throw HttpExeption(400, "Invalid or expired verification code");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.verificationCode = "";
  await user.save();
};

export const getUserProfileService = async (username: string) => {
  const user = await User.findOne({ username })
    .select("-password -verificationCode -token -__v") // скрываем лишнее
    .populate("followers", "username avatarUrl") // инф о подписчиках
    .populate("following", "username avatarUrl");
  return user;
};

export const getUserByIdService = async (userId: string) => {
  return await User.findById(userId)
    .select("-password -verificationCode -token -__v")
    .populate("followers", "username avatarUrl")
    .populate("following", "username avatarUrl");
};

export const updateUserProfile = async (
  userId: string,
  updateData: Partial<{
    fullname: string;
    username: string;
    bio: string;
    avatar: string;
  }>
) => {
  return await User.findByIdAndUpdate(userId, updateData, {
    new: true,
  }).select("-password");
};

export const searchUsers = async (query: string) => {
  const regex = new RegExp(query, "i");

  const users = await User.find({
    $or: [{ username: regex }, { fullname: regex }],
  }).select("_id username fullname avatarUrl");

  return users;
};

export const followUser = async (
  targetUserId: string,
  currentUserId: string
) => {
  if (targetUserId === currentUserId) {
    throw new Error("Нельзя подписаться на себя");
  }
  const user = await User.findById(targetUserId);
  const currentUser = await User.findById(currentUserId);

  if (!user || !currentUser) {
    throw new Error("Пользователь не найден");
  }

  if (!user.followers.some((id) => id.toString() === currentUserId)) {
    user.followers.push(currentUserId);
  }

  if (!currentUser.following.some((id) => id.toString() === targetUserId)) {
    currentUser.following.push(targetUserId);
  }

  await Promise.all([user.save(), currentUser.save()]);

  const toObjectId = (id: string | Types.ObjectId): Types.ObjectId =>
    typeof id === "string" ? new Types.ObjectId(id) : id;

  await createNotification({
    recipient: toObjectId(targetUserId),
    sender: toObjectId(currentUserId),
    type: "follow",
  });

  return user;
};

export const unfollowUser = async (
  targetUserId: string,
  currentUserId: string
) => {
  const user = await User.findById(targetUserId);
  const currentUser = await User.findById(currentUserId);

  if (!user || !currentUser) {
    throw new Error("Пользователь не найден");
  }

  user.followers = user.followers.filter(
    (followerId) => followerId.toString() !== currentUserId.toString()
  );

  currentUser.following = currentUser.following.filter(
    (followingId) => followingId.toString() !== targetUserId.toString()
  );

  await Promise.all([user.save(), currentUser.save()]);

  return user;
};
