import { Request, Response, NextFunction } from "express";
import * as usersService from "../services/user.service";

import validateBody from "../utils/validateBody";
import {
  userAddSchema,
  verifyCodeSchema,
  resetPasswordSchema,
} from "../validation/users.schema";

import { AuthenticatedRequest } from "../typescript/interfaces";

export const registerUserController = async (
  req: Request,
  res: Response
): Promise<void> => {
  await validateBody(userAddSchema, req.body);
  await usersService.registerUser((req as AuthenticatedRequest).body);

  res.status(201).json({
    message: "User succeffully register. Please confirm email with link",
  });
};

export const checkEmailController = async (req: Request, res: Response) => {
  const { email } = req.query;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "Email is required" });
  }

  const exists = await usersService.checkEmailExists(email);
  res.json({ exists });
};

export const checkUsernameController = async (req: Request, res: Response) => {
  const { username } = req.query;

  if (!username || typeof username !== "string") {
    return res.status(400).json({ message: "Username is required" });
  }

  const exists = await usersService.checkUsernameExists(username);
  res.json({ exists });
};

export const verifyController = async (req: Request, res: Response) => {
  await validateBody(verifyCodeSchema, req.body);
  await usersService.verify(req.body.code);

  res.status(200).json({
    message: "User successfully verified",
  });
};

export const getUserProfileController = async (req: Request, res: Response) => {
  try {
    const username = req.params.username;
    const user = await usersService.getUserProfileService(username);

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Ошибка при получении профиля:", error);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const getUserByIdController = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await usersService.getUserByIdService(userId);

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    res.json(user);
  } catch (error) {
    console.error("Ошибка при получении пользователя по ID:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const updateUserProfileController = async (
  req: Request,
  res: Response
) => {
  try {
    const { fullname, bio, link } = req.body;

    const avatarUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updatedFields: {
      fullname?: string;
      bio?: string;
      link?: string;
      avatarUrl?: string;
    } = { fullname, bio, link };

    if (avatarUrl) {
      updatedFields.avatarUrl = avatarUrl;
    }
    const user = await usersService.updateUserProfile(
      req.user.id,
      updatedFields
    );

    res.json(user);
  } catch (err) {
    console.error("Ошибка при обновлении профиля:", err);
    res.status(500).json({ message: "Ошибка при обновлении профиля" });
  }
};

export const changePasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { identifier } = req.body;

  try {
    await usersService.sendPasswordResetLink(identifier);
    res
      .status(200)
      .json({ message: "Reset link sent to email if user exists" });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await validateBody(resetPasswordSchema, req.body);

    const { verificationCode, newPassword } = req.body;
    await usersService.resetPasswordByCode(verificationCode, newPassword);

    res.status(200).json({ message: "Password successfully reset" });
  } catch (error) {
    next(error);
  }
};

export const searchUserController = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(400).json({ message: "Query is required" });
    }

    const users = await usersService.searchUsers(q);

    res.json(users);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const followUserController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;
    await usersService.followUser(id, currentUserId);

    res.status(200).json({ message: "Подписка оформлена" });
  } catch (error: any) {
    const status = error.message === "Нельзя подписаться на себя" ? 400 : 404;
    res.status(status).json({ message: error.message });
  }
};

export const unfollowUserController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;

    await usersService.unfollowUser(id, currentUserId);

    res.status(200).json({ message: "Отписка выполнена" });
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};
