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
exports.unlikeComment = exports.likeComment = exports.deleteComment = exports.getCommentsByPost = void 0;
const Post_1 = __importDefault(require("../db/Post"));
const Comment_1 = __importDefault(require("../db/Comment"));
const mongoose_1 = require("mongoose");
const getCommentsByPost = (postId) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield Post_1.default.findById(postId).populate({
        path: "comments",
        populate: { path: "author", select: "username avatarUrl" },
        options: { sort: { createdAt: 1 } },
    });
    if (!post)
        throw new Error("Post not found");
    return post.comments;
});
exports.getCommentsByPost = getCommentsByPost;
const deleteComment = (postId, commentId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const userObjId = new mongoose_1.Types.ObjectId(userId);
    const comment = yield Comment_1.default.findById(commentId);
    if (!comment)
        throw new Error("Comment not found");
    if (comment.author.toString() !== userObjId.toString())
        throw new Error("Unauthorized");
    yield comment.deleteOne();
    yield Post_1.default.findByIdAndUpdate(postId, { $pull: { comments: commentId } });
    return true;
});
exports.deleteComment = deleteComment;
const likeComment = (commentId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const userObjId = new mongoose_1.Types.ObjectId(userId);
    const comment = yield Comment_1.default.findByIdAndUpdate(commentId, { $addToSet: { likes: userObjId } }, { new: true }).populate("author", "username avatarUrl");
    return comment;
});
exports.likeComment = likeComment;
const unlikeComment = (commentId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const userObjId = new mongoose_1.Types.ObjectId(userId);
    const comment = yield Comment_1.default.findByIdAndUpdate(commentId, { $pull: { likes: userObjId } }, { new: true }).populate("author", "username avatarUrl");
    return comment;
});
exports.unlikeComment = unlikeComment;
