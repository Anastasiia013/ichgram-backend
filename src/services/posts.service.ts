import Post, { IPost } from "../db/Post";
import User from "../db/User";
import Comment, { IComment } from "../db/Comment";
import { Types } from "mongoose";
import { createNotification } from "./notification.service";

interface CreatePostInput {
  authorId: Types.ObjectId;
  imageUrl: string;
  caption?: string;
}

const toObjectId = (id: string | Types.ObjectId): Types.ObjectId =>
  typeof id === "string" ? new Types.ObjectId(id) : id;

export const createPostService = async ({
  authorId,
  imageUrl,
  caption = "",
}: CreatePostInput): Promise<IPost> => {
  return await Post.create({
    author: authorId,
    imageUrl,
    caption,
    likes: [],
    comments: [],
  });
};

export const getUserPostsService = async (username: string) => {
  const user = await User.findOne({ username });
  if (!user) return null;
  return await Post.find({ author: user._id }).sort({ createdAt: -1 });
};

export const getPostByIdService = async (postId: string) => {
  const post = await Post.findById(postId)
    .populate("author", "username avatarUrl")
    .populate({
      path: "comments",
      populate: [
        { path: "author", select: "username avatarUrl" },
        { path: "likes", select: "username avatarUrl" },
      ],
      options: { sort: { createdAt: 1 } },
    })
    .populate("likes", "username avatarUrl")
    .lean();

  if (!post) return null;

  return {
    ...post,
    author: post.author || { username: "", avatarUrl: "" },
  };
};

export const getExplorePostsService = async () => {
  return await Post.aggregate([{ $sample: { size: 100 } }]);
};

export const likePost = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);
  if (!post) throw new Error("Пост не найден");

  const userIdObj = toObjectId(userId);
  const userIdStr = userIdObj.toString();

  if (!post.likes.some((id) => id.toString() === userIdStr)) {
    post.likes.push(userIdObj);
    await post.save();

    if (post.author.toString() !== userIdStr) {
      try {
        await createNotification({
          recipient: toObjectId(post.author),
          sender: userIdObj,
          type: "like",
          post: post._id as Types.ObjectId,
        });
      } catch (err) {
        console.error("Failed to create notification (likePost):", err);
      }
    }
  }

  return post.likes.length;
};

export const unlikePost = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);
  if (!post) throw new Error("Пост не найден");

  const userIdStr = userId.toString();
  post.likes = post.likes.filter((id) => id.toString() !== userIdStr);
  await post.save();
  return post.likes.length;
};

export const likeComment = async (commentId: string, userId: string) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error("Комментарий не найден");

  const userIdObj = toObjectId(userId);
  const userIdStr = userIdObj.toString();

  if (!comment.likes.some((id) => id.toString() === userIdStr)) {
    comment.likes.push(userIdObj);
    await comment.save();

    if (comment.author.toString() !== userIdStr) {
      try {
        // Получаем post только с _id
        const post = await Post.findOne({ comments: comment._id }).select(
          "_id"
        );
        if (post) {
          await createNotification({
            recipient: toObjectId(comment.author),
            sender: userIdObj,
            type: "likeOnComment",
            post: post._id as Types.ObjectId,
          });
        }
      } catch (err) {
        console.error("Failed to create notification (likeComment):", err);
      }
    }
  }

  return comment.likes.length;
};

export const unlikeComment = async (commentId: string, userId: string) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error("Комментарий не найден");

  comment.likes = comment.likes.filter(
    (id) => id.toString() !== userId.toString()
  );
  await comment.save();
  return comment.likes.length;
};

export const createComment = async (
  postId: string,
  authorId: string,
  text: string
) => {
  const authorObjId = toObjectId(authorId);

  const comment = new Comment({
    author: authorObjId,
    text,
    likes: [],
  });
  await comment.save();

  const post = await Post.findById(postId);
  await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });

  if (post && post.author.toString() !== authorId) {
    try {
      await createNotification({
        recipient: toObjectId(post.author),
        sender: authorObjId,
        type: "comment",
        post: post._id as Types.ObjectId,
      });
    } catch (err) {
      console.error("Failed to create notification (createComment):", err);
    }
  }

  return await Comment.findById(comment._id).populate(
    "author",
    "username avatarUrl"
  );
};

export const deletePost = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);
  if (!post) return false;
  if (post.author.toString() !== userId.toString()) return false;

  await Post.deleteOne({ _id: postId });
  return true;
};

export const editPost = async (
  postId: string,
  newCaption: string,
  userId: string
) => {
  const post = await Post.findById(postId);
  if (!post || post.author.toString() !== userId.toString()) return null;

  post.caption = newCaption;
  await post.save();
  return post;
};

export async function getFeedPostsService(userId: string) {
  const user = await User.findById(userId).select("following");
  if (!user) throw new Error("User not found");

  return await Post.find({ author: { $in: user.following } })
    .sort({ createdAt: -1 })
    .populate("author", "username avatarUrl")
    .exec();
}
