import express from "express";
import {
  getExplorePosts,
  createPost,
  getUserPosts,
  getPostByIdController,
    likeCommentController,
    unlikeCommentController,
  likePostController,
  unlikePostController,
  deletePostController,
  editPostController,
  getFeedPostsController,
  createCommentController
} from "../controllers/posts.controller";
import { authenticate } from "../middlewares/authorization";
import { upload } from "../middlewares/uploadMiddleware";

const postsRouter = express.Router();

postsRouter.get("/dashboard", authenticate, getFeedPostsController);

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
postsRouter.post(
  "/:postId/comments/:commentId/like",
  authenticate,
  likeCommentController
);
postsRouter.post(
  "/:postId/comments/:commentId/unlike",
  authenticate,
  unlikeCommentController
);

postsRouter.post("/:postId/comments", authenticate, createCommentController);

postsRouter.delete("/:postId", authenticate, deletePostController);
postsRouter.put("/:postId/edit", authenticate, editPostController);

export default postsRouter;
