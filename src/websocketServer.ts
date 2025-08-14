import { Server } from "socket.io";
import { createServer } from "node:http";
import Notification from "./db/Notification";
import "dotenv/config";

const FRONTEND_URL = process.env.FRONTEND_URL || "*";

const httpServer = createServer();

export const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
  },
});

const startWebsocketServer = () => {
  io.on("connection", (socket) => {
    console.log("New frontend connected, socket id:", socket.id);

    socket.on("join", (userId: string) => {
      console.log(`User ${userId} joined their room`);
      socket.join(userId);
      console.log(`Socket ${socket.id} joined room ${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected, socket id:", socket.id);
    });
  });

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
      } else {
        console.error("Notification not found after insert change");
      }
    }
  });

  const port = process.env.SOCKET_PORT || 4000;
  httpServer.listen(port, () =>
    console.log(`Websocket server running on port ${port}`)
  );
};

export default startWebsocketServer;
