import { Request, Response } from "express";
import * as commentsService from "../services/comments.service";

export const getCommentsByPostController = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const comments = await commentsService.getCommentsByPost(postId);
    res.json(comments);
  } catch (error: any) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteCommentController = async (req: Request, res: Response) => {
  try {
    const { postId, commentId } = req.params;
    const userId = String(req.user!._id);

    const success = await commentsService.deleteComment(postId, commentId, userId);

    if (!success) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json({ message: "Comment deleted" });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return res.status(403).json({ message: error.message });
    }
    console.error("Delete comment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const likeCommentController = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = String(req.user!._id);

    const updatedComment = await commentsService.likeComment(commentId, userId);

    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.json(updatedComment);
  } catch (error: any) {
    console.error("Like comment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const unlikeCommentController = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = String(req.user!._id);

    const updatedComment = await commentsService.unlikeComment(commentId, userId);

    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.json(updatedComment);
  } catch (error: any) {
    console.error("Unlike comment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
