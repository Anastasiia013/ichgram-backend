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
  const posts = await Post.aggregate([
    { $sample: { size: 100 } }, //можно бы добавить пагинацию в будущем
  ]);
  return posts;
};

// export const likePost = async (postId: string, userId: string) => {
//   const post = await Post.findById(postId);
//   if (!post) throw new Error("Пост не найден");

//   const userIdStr = userId.toString();

//   if (!post.likes.some((id) => id.toString() === userIdStr)) {
//     post.likes.push(new Types.ObjectId(userId));
//     await post.save();
//   }

//   if (post.author.toString() !== userIdStr) {
//     await createNotification({
//       recipient: post.author,
//       sender: userId,
//       type: "like",
//       post: post._id,
//     });
//   }

//   return post.likes.length;
// };

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
//   if (!comment.likes.some((id) => id.toString() === userIdStr)) {
//     comment.likes.push(new Types.ObjectId(userId));
//     await comment.save();
//   }

//   if (comment.author.toString() !== userIdStr) {
//     await createNotification({
//       recipient: comment.author,
//       sender: userId,
//       type: "like",
//       post: undefined, // или можно прокинуть commentId, если хочешь расширить модель
//     });
//   }

//   return comment.likes.length;
// };

export const unlikeComment = async (
  commentId: string,
  userId: string
): Promise<number> => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error("Комментарий не найден");

  comment.likes = comment.likes.filter(
    (id) => id.toString() !== userId.toString()
  );
  await comment.save();

  return comment.likes.length;
};

export const deletePost = async (
  postId: string,
  userId: string
): Promise<boolean> => {
  const post = await Post.findById(postId);
  if (!post) return false;

  if (post.author.toString() !== userId.toString()) {
    return false;
  }

  await Post.deleteOne({ _id: postId });
  return true;
};

export const editPost = async (
  postId: string,
  newCaption: string,
  userId: string
) => {
  const post = await Post.findById(postId);
  if (!post) return null;

  if (post.author.toString() !== userId.toString()) {
    return null; //смотрим кто автор поста
  }

  post.caption = newCaption;
  await post.save();

  return post;
};

export async function getFeedPostsService(userId: string) {
  const user = await User.findById(userId).select("following");
  if (!user) throw new Error("User not found");

  const posts = await Post.find({
    author: { $in: user.following },
  })
    .sort({ createdAt: -1 })
    .populate("author", "username avatarUrl")
    .exec();

  return posts;
}

// export const createComment = async (
//   postId: string,
//   authorId: string,
//   text: string
// ): Promise<IComment> => {
//   const authorObjId = new Types.ObjectId(authorId);

//   const comment = new Comment({
//     author: authorObjId,
//     text,
//     likes: [],
//   });

//   await comment.save();

//   await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });

//   if (post && post.author.toString() !== authorId) {
//     await createNotification({
//       recipient: post.author,
//       sender: authorId,
//       type: "comment",
//       post: post._id,
//     });
//   }

//   const populatedComment = await Comment.findById(comment._id).populate(
//     "author",
//     "username avatarUrl"
//   );

//   return populatedComment!;
// };

const toObjectId = (id: string | Types.ObjectId): Types.ObjectId =>
  typeof id === "string" ? new Types.ObjectId(id) : id;

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
        if (post && post._id) {
          await createNotification({
            recipient: toObjectId(post.author),
            sender: userIdObj,
            type: "like",
            post: post._id as Types.ObjectId,
          });
        }
      } catch (err) {
        console.error("Failed to create notification (likePost):", err);
      }
    }
  }

  return post.likes.length;
};

export const likeComment = async (
  commentId: string,
  userId: string
): Promise<number> => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error("Комментарий не найден");

  const userIdObj = toObjectId(userId);
  const userIdStr = userIdObj.toString();

  if (!comment.likes.some((id) => id.toString() === userIdStr)) {
    comment.likes.push(userIdObj);
    await comment.save();

    if (comment.author.toString() !== userIdStr) {
      try {
        console.log("вызываем лайк коммент");

        await createNotification({
          recipient: toObjectId(comment.author),
          sender: userIdObj,
          type: "likeOnComment",
          // пост здесь не передаем, так как комментарий не хранит postId
        });
      } catch (err) {
        console.error("Failed to create notification (likeComment):", err);
      }
    }
  }

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
      if (post && post._id) {
        await createNotification({
          recipient: toObjectId(post.author),
          sender: authorObjId,
          type: "comment",
          post: post._id as Types.ObjectId,
        });
      }
    } catch (err) {
      console.error("Failed to create notification (createComment):", err);
    }
  }

  const populatedComment = await Comment.findById(comment._id).populate(
    "author",
    "username avatarUrl"
  );

  return populatedComment;
};
