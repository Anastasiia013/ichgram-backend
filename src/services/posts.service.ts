import Post, { IPost } from "../db/Post";
import User from "../db/User";
import { Types } from "mongoose";

interface CreatePostInput {
  authorId: Types.ObjectId;
  imageUrl: string;
  caption?: string;
}

export const createPostService = async ({
  authorId,
  imageUrl,
  caption = "",
}: CreatePostInput): Promise<IPost> => {
  const newPost = await Post.create({
    author: authorId,
    imageUrl,
    caption,
    likes: [],
    comments: [],
  });

  return newPost;
};

export const getUserPostsService = async (username: string) => {
  const user = await User.findOne({ username });
  if (!user) return null;

  const posts = await Post.find({ author: user._id }).sort({ createdAt: -1 });

  return posts;
};

export const getPostByIdService = async (postId: string) => {
  const post = await Post.findById(postId);
  return post;
};

export const getExplorePostsService = async () => {
  const posts = await Post.aggregate([
    // { $match: { isPublic: true } }, // если нужно фильтровать по видимости
    { $sample: { size: 100 } }, // 20 случайных постов
  ]);

  return posts;
};

export const likePost = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);
  if (!post) throw new Error("Пост не найден");

  const userIdStr = userId.toString();

  if (!post.likes.some((id) => id.toString() === userIdStr)) {
    post.likes.push(new Types.ObjectId(userId));
    await post.save();
  }

  return post.likes.length;
};

export const unlikePost = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);

  if (!post) {
    console.error("POST NOT FOUND:", postId);
    throw new Error("Пост не найден");
  }

  const userIdStr = userId.toString();
  post.likes = post.likes.filter((id) => id.toString() !== userIdStr);
  await post.save();

  return post.likes.length;
};


// export const likeComment = async (
//   commentId: string,
//   userId: string
// ): Promise<number> => {
//   const comment = await Comment.findById(commentId);
//   if (!comment) throw new Error("Комментарий не найден");

//   const userIdStr = userId.toString();
//   if (!comment.likes.some(id => id.toString() === userIdStr)) {
//     comment.likes.push(new Types.ObjectId(userId));
//     await comment.save();
//   }

//   return comment.likes.length;
// };

// export const unlikeComment = async (
//   commentId: string,
//   userId: string
// ): Promise<number> => {
//   const comment = await Comment.findById(commentId);
//   if (!comment) throw new Error("Комментарий не найден");

//   comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
//   await comment.save();

//   return comment.likes.length;
// };
