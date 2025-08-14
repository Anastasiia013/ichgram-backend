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
exports.editPost = exports.deletePost = exports.createComment = exports.unlikeComment = exports.likeComment = exports.unlikePost = exports.likePost = exports.getExplorePostsService = exports.getPostByIdService = exports.getUserPostsService = exports.createPostService = void 0;
exports.getFeedPostsService = getFeedPostsService;
const Post_1 = __importDefault(require("../db/Post"));
const User_1 = __importDefault(require("../db/User"));
const Comment_1 = __importDefault(require("../db/Comment"));
const mongoose_1 = require("mongoose");
const notification_service_1 = require("./notification.service");
const toObjectId = (id) => typeof id === "string" ? new mongoose_1.Types.ObjectId(id) : id;
const createPostService = (_a) => __awaiter(void 0, [_a], void 0, function* ({ authorId, imageUrl, caption = "", }) {
    return yield Post_1.default.create({
        author: authorId,
        imageUrl,
        caption,
        likes: [],
        comments: [],
    });
});
exports.createPostService = createPostService;
const getUserPostsService = (username) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findOne({ username });
    if (!user)
        return null;
    return yield Post_1.default.find({ author: user._id }).sort({ createdAt: -1 });
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
    return yield Post_1.default.aggregate([{ $sample: { size: 100 } }]);
});
exports.getExplorePostsService = getExplorePostsService;
const likePost = (postId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield Post_1.default.findById(postId);
    if (!post)
        throw new Error("Пост не найден");
    const userIdObj = toObjectId(userId);
    const userIdStr = userIdObj.toString();
    if (!post.likes.some((id) => id.toString() === userIdStr)) {
        post.likes.push(userIdObj);
        yield post.save();
        if (post.author.toString() !== userIdStr) {
            try {
                yield (0, notification_service_1.createNotification)({
                    recipient: toObjectId(post.author),
                    sender: userIdObj,
                    type: "like",
                    post: post._id,
                });
            }
            catch (err) {
                console.error("Failed to create notification (likePost):", err);
            }
        }
    }
    return post.likes.length;
});
exports.likePost = likePost;
const unlikePost = (postId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield Post_1.default.findById(postId);
    if (!post)
        throw new Error("Пост не найден");
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
    const userIdObj = toObjectId(userId);
    const userIdStr = userIdObj.toString();
    if (!comment.likes.some((id) => id.toString() === userIdStr)) {
        comment.likes.push(userIdObj);
        yield comment.save();
        if (comment.author.toString() !== userIdStr) {
            try {
                // Получаем post только с _id
                const post = yield Post_1.default.findOne({ comments: comment._id }).select("_id");
                if (post) {
                    yield (0, notification_service_1.createNotification)({
                        recipient: toObjectId(comment.author),
                        sender: userIdObj,
                        type: "likeOnComment",
                        post: post._id,
                    });
                }
            }
            catch (err) {
                console.error("Failed to create notification (likeComment):", err);
            }
        }
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
const createComment = (postId, authorId, text) => __awaiter(void 0, void 0, void 0, function* () {
    const authorObjId = toObjectId(authorId);
    const comment = new Comment_1.default({
        author: authorObjId,
        text,
        likes: [],
    });
    yield comment.save();
    const post = yield Post_1.default.findById(postId);
    yield Post_1.default.findByIdAndUpdate(postId, { $push: { comments: comment._id } });
    if (post && post.author.toString() !== authorId) {
        try {
            yield (0, notification_service_1.createNotification)({
                recipient: toObjectId(post.author),
                sender: authorObjId,
                type: "comment",
                post: post._id,
            });
        }
        catch (err) {
            console.error("Failed to create notification (createComment):", err);
        }
    }
    return yield Comment_1.default.findById(comment._id).populate("author", "username avatarUrl");
});
exports.createComment = createComment;
const deletePost = (postId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield Post_1.default.findById(postId);
    if (!post)
        return false;
    if (post.author.toString() !== userId.toString())
        return false;
    yield Post_1.default.deleteOne({ _id: postId });
    return true;
});
exports.deletePost = deletePost;
const editPost = (postId, newCaption, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield Post_1.default.findById(postId);
    if (!post || post.author.toString() !== userId.toString())
        return null;
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
        return yield Post_1.default.find({ author: { $in: user.following } })
            .sort({ createdAt: -1 })
            .populate("author", "username avatarUrl")
            .exec();
    });
}
