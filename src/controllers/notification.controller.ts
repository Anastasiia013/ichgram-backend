import { Request, Response } from "express";
import * as notificationsService from "../services/notification.service";
import { Types } from "mongoose";

export const getNotifications = async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user._id);
  try {
    const notifications = await notificationsService.getUserNotifications(
      userId
    );
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user._id);
  try {
    await notificationsService.markAsRead(userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark notifications as read" });
  }
};
