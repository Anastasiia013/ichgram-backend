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
exports.io = void 0;
const socket_io_1 = require("socket.io");
const node_http_1 = require("node:http");
const Notification_1 = __importDefault(require("./db/Notification"));
require("dotenv/config");
const FRONTEND_URL = process.env.FRONTEND_URL || "*";
const httpServer = (0, node_http_1.createServer)();
exports.io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: FRONTEND_URL,
    },
});
const startWebsocketServer = () => {
    exports.io.on("connection", (socket) => {
        console.log("New frontend connected, socket id:", socket.id);
        socket.on("join", (userId) => {
            console.log(`User ${userId} joined their room`);
            socket.join(userId);
            console.log(`Socket ${socket.id} joined room ${userId}`);
        });
        socket.on("disconnect", () => {
            console.log("User disconnected, socket id:", socket.id);
        });
    });
    Notification_1.default.watch().on("change", (change) => __awaiter(void 0, void 0, void 0, function* () {
        if (change.operationType === "insert") {
            const notification = yield Notification_1.default.findById(change.fullDocument._id)
                .populate("sender", "username avatarUrl")
                .populate("post", "imageUrl")
                .lean();
            if (notification) {
                exports.io.to(notification.recipient.toString()).emit("newNotification", notification);
            }
            else {
                console.error("Notification not found after insert change");
            }
        }
    }));
    const port = process.env.SOCKET_PORT || 4000;
    httpServer.listen(port, () => console.log(`Websocket server running on port ${port}`));
};
exports.default = startWebsocketServer;
