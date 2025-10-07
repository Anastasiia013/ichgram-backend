import express from "express";
import cors from "cors";
import path from "path";
import http from "node:http";
import { Server } from "socket.io";

import notFoundHandler from "./middlewares/notFoundHandler";
import errorHandler from "./middlewares/errorHandler";

import userRouter from "./routes/user.router";
import authRouter from "./routes/auth.router";
import postsRouter from "./routes/posts.router";
import commentsRouter from "./routes/comments.router";
import notificationRouter from "./routes/notification.router";

import Notification from "./db/Notification";

const startServer = () => {
  const app = express();

  app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
  app.use(express.json());
  app.use(
    "/uploads",
    express.static(path.join(__dirname, "../public/uploads"))
  );

  app.use("/api/users", userRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/posts", postsRouter);
  app.use("/api/comments", commentsRouter);
  app.use("/api/notifications", notificationRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  // HTTP сервер поверх Express
  const server = http.createServer(app);

  // Socket.IO на том же сервере
  const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || "*" },
  });

  io.on("connection", (socket) => {
    console.log("New frontend connected, socket id:", socket.id);

    socket.on("join", (userId: string) => {
      socket.join(userId);
      console.log(`Socket ${socket.id} joined room ${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected, socket id:", socket.id);
    });
  });

  // Слушаем изменения в коллекции Notification
  Notification.watch().on("change", async (change) => {
    if (change.operationType === "insert") {
      const notification = await Notification.findById(change.fullDocument._id)
        .populate("sender", "username avatarUrl")
        .populate("post", "imageUrl")
        .lean();

      if (notification) {
        io.to(notification.recipient.toString()).emit(
          "newNotification",
          notification
        );
      }
    }
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => console.log(`Server running on ${port} port`));
};

export default startServer;
