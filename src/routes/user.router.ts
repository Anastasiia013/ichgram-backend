import { Router } from "express";
import {
  registerUserController,
  checkEmailController,
  checkUsernameController,
  changePasswordController,
  resetPasswordController,
  getUserProfileController,
  getUserByIdController,
  updateUserProfileController,
  verifyController,
  searchUserController,
  followUserController,
  unfollowUserController,
} from "../controllers/user.controller";

import { authenticate } from "../middlewares/authorization";
import { upload } from "../middlewares/uploadMiddleware";

const userRouter = Router();

userRouter.post("/register", registerUserController);

userRouter.get("/check-email", checkEmailController);
userRouter.get("/check-username", checkUsernameController);

userRouter.post("/verify", verifyController);

userRouter.post("/forgot-password", changePasswordController);
userRouter.post("/reset-password", resetPasswordController);

userRouter.get("/search", searchUserController);

userRouter.get("/:username", getUserProfileController);
userRouter.patch(
  "/me",
  authenticate,
  upload.single("avatar"),
  updateUserProfileController
);

userRouter.get("/by-id/:id", getUserByIdController);

userRouter.post("/:id/follow", authenticate, followUserController);
userRouter.post("/:id/unfollow", authenticate, unfollowUserController);

export default userRouter;
