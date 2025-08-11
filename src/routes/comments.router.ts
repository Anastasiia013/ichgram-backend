import { Router } from "express";
import {
  deleteCommentController,
  getCommentsByPostController,
  likeCommentController,
  unlikeCommentController,
} from "../controllers/comments.controller";
import { authenticate } from "../middlewares/authorization";

const commentsRouter = Router();

commentsRouter.get("/:postId", getCommentsByPostController);

commentsRouter.delete(
  "/:postId/:commentId",
  authenticate,
  deleteCommentController
);

commentsRouter.post(
  "/posts/:postId/comments/:commentId/like",
  authenticate,
  likeCommentController
);

commentsRouter.post(
  "/posts/:postId/comments/:commentId/unlike",
  authenticate,
  unlikeCommentController
);

export default commentsRouter;
