import Post from "../db/Post";
import Comment, { IComment } from "../db/Comment";
import { Types } from "mongoose";

export const getCommentsByPost = async (postId: string) => {
  const post = await Post.findById(postId).populate({
    path: "comments",
    populate: { path: "author", select: "username avatarUrl" },
    options: { sort: { createdAt: 1 } },
  });

  if (!post) throw new Error("Post not found");

  return post.comments;
};

export const deleteComment = async (
  postId: string,
  commentId: string,
  userId: string
) => {
  const userObjId = new Types.ObjectId(userId);

  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error("Comment not found");
  if (comment.author.toString() !== userObjId.toString())
    throw new Error("Unauthorized");

  await comment.deleteOne();

  await Post.findByIdAndUpdate(postId, { $pull: { comments: commentId } });

  return true;
};

export const likeComment = async (
  commentId: string,
  userId: string
): Promise<IComment | null> => {
  const userObjId = new Types.ObjectId(userId);

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    { $addToSet: { likes: userObjId } },
    { new: true }
  ).populate("author", "username avatarUrl");

  return comment;
};

export const unlikeComment = async (
  commentId: string,
  userId: string
): Promise<IComment | null> => {
  const userObjId = new Types.ObjectId(userId);

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    { $pull: { likes: userObjId } },
    { new: true }
  ).populate("author", "username avatarUrl");

  return comment;
};
