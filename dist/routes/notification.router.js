"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authorization_1 = require("../middlewares/authorization");
const notification_controller_1 = require("../controllers/notification.controller");
const notificationRouter = express_1.default.Router();
notificationRouter.get("/", authorization_1.authenticate, notification_controller_1.getNotifications);
notificationRouter.put("/read", authorization_1.authenticate, notification_controller_1.markAllAsRead);
exports.default = notificationRouter;
