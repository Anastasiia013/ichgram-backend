"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlikePost = exports.likePost = exports.getExplorePostsService = exports.getPostByIdService = exports.getUserPostsService = exports.createPostService = void 0;
const Post_1 = __importDefault(require("../db/Post"));
const User_1 = __importDefault(require("../db/User"));
const mongoose_1 = require("mongoose");
const createPostService = (_a) => __awaiter(void 0, [_a], void 0, function* ({ authorId, imageUrl, caption = "", }) {
    const newPost = yield Post_1.default.create({
        author: authorId,
        imageUrl,
        caption,
        likes: [],
        comments: [],
    });
    return newPost;
});
exports.createPostService = createPostService;
const getUserPostsService = (username) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findOne({ username });
    if (!user)
        return null;
    const posts = yield Post_1.default.find({ author: user._id }).sort({ createdAt: -1 });
    return posts;
});
exports.getUserPostsService = getUserPostsService;
const getPostByIdService = (postId) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield Post_1.default.findById(postId);
    return post;
});
exports.getPostByIdService = getPostByIdService;
const getExplorePostsService = () => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield Post_1.default.aggregate([
        // { $match: { isPublic: true } }, // если нужно фильтровать по видимости
        { $sample: { size: 100 } }, // 20 случайных постов
    ]);
    return posts;
});
exports.getExplorePostsService = getExplorePostsService;
const likePost = (postId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield Post_1.default.findById(postId);
    if (!post)
        throw new Error("Пост не найден");
    const userIdStr = userId.toString();
    if (!post.likes.some((id) => id.toString() === userIdStr)) {
        post.likes.push(new mongoose_1.Types.ObjectId(userId));
        yield post.save();
    }
    return post.likes.length;
});
exports.likePost = likePost;
const unlikePost = (postId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield Post_1.default.findById(postId);
    if (!post) {
        console.error("POST NOT FOUND:", postId);
        throw new Error("Пост не найден");
    }
    const userIdStr = userId.toString();
    post.likes = post.likes.filter((id) => id.toString() !== userIdStr);
    yield post.save();
    return post.likes.length;
});
exports.unlikePost = unlikePost;
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
