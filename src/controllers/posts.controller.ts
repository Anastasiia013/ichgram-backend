import { Request, Response } from "express";
import { Types } from "mongoose";
import * as postsService from "../services/posts.service";

export const createPost = async (req: Request, res: Response) => {
  try {
    const { caption } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Image is required" });
    }
    const authorId = new Types.ObjectId(String(req.user!._id));

    const newPost = await postsService.createPostService({
      authorId,
      imageUrl: `/uploads/${file.filename}`,
      caption,
    });

    res.status(201).json(newPost);
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserPosts = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    const posts = await postsService.getUserPostsService(username);
    if (!posts) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    res.json(posts);
  } catch (error) {
    console.error("Ошибка при получении постов:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const getPostByIdController = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;
    const post = await postsService.getPostByIdService(postId);

    if (!post) {
      return res.status(404).json({ message: "Пост не найден" });
    }

    res.json(post);
  } catch (error) {
    console.error("Ошибка при получении поста:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const getExplorePosts = async (req: Request, res: Response) => {
  try {
    const posts = await postsService.getExplorePostsService();
    res.json(posts);
  } catch (error) {
    console.error("Error in getExplorePosts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const likePostController = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    const likesCount = await postsService.likePost(postId, userId);
    res.json({ likesCount });
  } catch (err) {
    console.error("LIKE controller error:", err);

    if (err instanceof Error) {
      res
        .status(500)
        .json({ message: "Ошибка при лайке поста", error: err.message });
    } else {
      res.status(500).json({ message: "Неизвестная ошибка при лайке поста" });
    }
  }
};

export const unlikePostController = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    const likesCount = await postsService.unlikePost(postId, userId);
    res.status(200).json({ likes: likesCount });
  } catch (err) {
    console.error("Ошибка в unlikePostController:", err);
    res.status(500).json({ message: "Ошибка при удалении лайка" });
  }
};


// export const likeCommentController = async (req, res) => {
//   try {
//     const likesCount = await postsService.likeComment(
//       req.params.commentId,
//       req.user._id
//     );
//     res.status(200).json({ message: "Поставлен лайк", likesCount });
//   } catch (error) {
//     res.status(500).json({ message: error.message || "Ошибка сервера" });
//   }
// };

// export const unlikeCommentController = async (req, res) => {
//   try {
//     const likesCount = await postsService.unlikeComment(
//       req.params.commentId,
//       req.user._id
//     );
//     res.status(200).json({ message: "Лайк удалён", likesCount });
//   } catch (error) {
//     res.status(500).json({ message: error.message || "Ошибка сервера" });
//   }
// };
