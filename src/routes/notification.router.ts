import express from "express";
import { authenticate } from "../middlewares/authorization";
import {
  getNotifications,
  markAllAsRead,
} from "../controllers/notification.controller";

const notificationRouter = express.Router();

notificationRouter.get("/", authenticate, getNotifications);
notificationRouter.put("/read", authenticate, markAllAsRead);

export default notificationRouter;