import express from "express";
import {
  getExplorePosts,
  createPost,
  getUserPosts,
  getPostByIdController,
//   likeCommentController,
//   unlikeCommentController,
  likePostController,
  unlikePostController,
} from "../controllers/posts.controller";
import { authenticate } from "../middlewares/authorization";
import { upload } from "../middlewares/uploadMiddleware";

const postsRouter = express.Router();

postsRouter.get("/explore", getExplorePosts);

postsRouter.get("/:username/posts", getUserPosts);
postsRouter.get("/:postId", getPostByIdController);

postsRouter.post(
  "/create-new-post",
  authenticate,
  upload.single("image"),
  createPost
);

postsRouter.post("/:postId/like", authenticate, likePostController);
postsRouter.post("/:postId/unlike", authenticate, unlikePostController);
// postsRouter.post(
//   "/:postId/comments/:commentId/like",
//   authenticate,
//   likeCommentController
// );
// postsRouter.post(
//   "/:postId/comments/:commentId/unlike",
//   authenticate,
//   unlikeCommentController
// );

export default postsRouter;
