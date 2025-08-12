"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.getUserNotifications = exports.createNotification = void 0;
const Notification_1 = __importDefault(require("../db/Notification"));
const websocketServer_1 = require("../websocketServer");
const createNotification = (_a) => __awaiter(void 0, [_a], void 0, function* ({ recipient, sender, type, post, }) {
    const notificationData = {
        recipient,
        sender,
        type,
        isRead: false,
    };
    if (type === "like" || type === "comment") {
        notificationData.post = post;
    }
    else {
        // Для likeOnComment и follow — поле post отсутствует
        notificationData.post = undefined;
    }
    const notification = new Notification_1.default(notificationData);
    const savedNotification = yield notification.save();
    const populatedNotification = yield Notification_1.default.findById(savedNotification._id)
        .populate("sender", "username avatarUrl")
        .populate("post", "imageUrl")
        .lean();
    websocketServer_1.io.to(recipient.toString()).emit("newNotification", populatedNotification);
    return savedNotification;
});
exports.createNotification = createNotification;
const getUserNotifications = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield Notification_1.default.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .populate("sender", "username avatarUrl")
        .populate("post", "imageUrl")
        .lean();
});
exports.getUserNotifications = getUserNotifications;
const markAsRead = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    yield Notification_1.default.updateMany({ recipient: userId, isRead: false }, { isRead: true });
});
exports.markAsRead = markAsRead;
