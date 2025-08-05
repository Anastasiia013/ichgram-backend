import express from "express";
import cors from "cors";
import path from "path";

import notFoundHandler from "./middlewares/notFoundHandler";
import errorHandler from "./middlewares/errorHandler";

import userRouter from "./routes/user.router";
import authRouter from "./routes/auth.router";
import postsRouter from "./routes/posts.router";

const startServer = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(
    "/uploads",
    express.static(path.join(__dirname, "../public/uploads"))
  );

  app.use("/api/users", userRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/posts", postsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  const port = process.env.PORT || 3000;

  app.listen(port, () => console.log(`Server running on ${port} port`));
};

export default startServer;
