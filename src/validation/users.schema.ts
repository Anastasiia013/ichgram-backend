import * as Yup from "yup";

import {
  emailValidation,
  passwordValidation,
} from "../constants/users.constants";

//проверка пароля
export const passwordSchema = Yup.string()
  .trim()
  .min(6)
  .matches(passwordValidation.value, passwordValidation.message)
  .required();

export type PasswordSchema = Yup.InferType<typeof passwordSchema>;

export const resetPasswordSchema = Yup.object().shape({
  verificationCode: Yup.string().required("Verification code is required"),
  newPassword: Yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
});

//проверка имейл
export const emailSchema = Yup.string()
  .trim()
  .matches(emailValidation.value, emailValidation.message)
  .required();

export type EmailSchema = Yup.InferType<typeof emailSchema>;

export const usernameSchema = Yup.string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .matches(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores");


//проверка данных пользователя
export const userAddSchema = Yup.object({
  fullname: Yup.string().trim().required(),
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export type UserAddSchema = Yup.InferType<typeof userAddSchema>;

export const verifyCodeSchema = Yup.object({
  code: Yup.string().trim().required(),
});

export const changePasswordSchema = Yup.object({
  oldPassword: passwordSchema,
  newPassword: passwordSchema,
});

export type ChangePasswordSchema = Yup.InferType<typeof changePasswordSchema>;
