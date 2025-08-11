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
exports.createComment = exports.editPost = exports.deletePost = exports.unlikeComment = exports.likeComment = exports.unlikePost = exports.likePost = exports.getExplorePostsService = exports.getPostByIdService = exports.getUserPostsService = exports.createPostService = void 0;
exports.getFeedPostsService = getFeedPostsService;
const Post_1 = __importDefault(require("../db/Post"));
const User_1 = __importDefault(require("../db/User"));
const Comment_1 = __importDefault(require("../db/Comment"));
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
    const post = yield Post_1.default.findById(postId)
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
    if (!post)
        return null;
    return Object.assign(Object.assign({}, post), { author: post.author || { username: "", avatarUrl: "" } });
});
exports.getPostByIdService = getPostByIdService;
const getExplorePostsService = () => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield Post_1.default.aggregate([
        { $sample: { size: 100 } }, //можно бы добавить пагинацию в будущем
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
const likeComment = (commentId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const comment = yield Comment_1.default.findById(commentId);
    if (!comment)
        throw new Error("Комментарий не найден");
    const userIdStr = userId.toString();
    if (!comment.likes.some((id) => id.toString() === userIdStr)) {
        comment.likes.push(new mongoose_1.Types.ObjectId(userId));
        yield comment.save();
    }
    return comment.likes.length;
});
exports.likeComment = likeComment;
const unlikeComment = (commentId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const comment = yield Comment_1.default.findById(commentId);
    if (!comment)
        throw new Error("Комментарий не найден");
    comment.likes = comment.likes.filter((id) => id.toString() !== userId.toString());
    yield comment.save();
    return comment.likes.length;
});
exports.unlikeComment = unlikeComment;
const deletePost = (postId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield Post_1.default.findById(postId);
    if (!post)
        return false;
    if (post.author.toString() !== userId.toString()) {
        return false;
    }
    yield Post_1.default.deleteOne({ _id: postId });
    return true;
});
exports.deletePost = deletePost;
const editPost = (postId, newCaption, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield Post_1.default.findById(postId);
    if (!post)
        return null;
    if (post.author.toString() !== userId.toString()) {
        return null; //смотрим кто автор поста
    }
    post.caption = newCaption;
    yield post.save();
    return post;
});
exports.editPost = editPost;
function getFeedPostsService(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield User_1.default.findById(userId).select("following");
        if (!user)
            throw new Error("User not found");
        const posts = yield Post_1.default.find({
            author: { $in: user.following },
        })
            .sort({ createdAt: -1 })
            .populate("author", "username avatarUrl")
            .exec();
        return posts;
    });
}
const createComment = (postId, authorId, text) => __awaiter(void 0, void 0, void 0, function* () {
    const authorObjId = new mongoose_1.Types.ObjectId(authorId);
    const comment = new Comment_1.default({
        author: authorObjId,
        text,
        likes: [],
    });
    yield comment.save();
    yield Post_1.default.findByIdAndUpdate(postId, { $push: { comments: comment._id } });
    const populatedComment = yield Comment_1.default.findById(comment._id).populate("author", "username avatarUrl");
    return populatedComment;
});
exports.createComment = createComment;
