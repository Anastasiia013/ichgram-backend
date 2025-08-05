import * as Yup from "yup";

import { passwordSchema, emailSchema, usernameSchema } from "./users.schema";

export const loginSchema = Yup.object({
  identifier: Yup.string()
    .required("Identifier is required")
    .test(
      "is-email-or-username",
      "Must be a valid email or username",
      (value) => {
        if (!value) return false;
        return (
          emailSchema.isValidSync(value) || usernameSchema.isValidSync(value)
        );
      }
    ),
  password: passwordSchema,
});

export type Login = Yup.InferType<typeof loginSchema>;
