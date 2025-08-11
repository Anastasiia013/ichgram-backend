"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommentController = exports.editPostController = exports.deletePostController = exports.unlikeCommentController = exports.likeCommentController = exports.unlikePostController = exports.likePostController = exports.getExplorePosts = exports.getPostByIdController = exports.getUserPosts = exports.createPost = void 0;
exports.getFeedPostsController = getFeedPostsController;
const mongoose_1 = require("mongoose");
const postsService = __importStar(require("../services/posts.service"));
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { caption } = req.body;
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: "Image is required" });
        }
        const authorId = new mongoose_1.Types.ObjectId(String(req.user._id));
        const newPost = yield postsService.createPostService({
            authorId,
            imageUrl: `/uploads/${file.filename}`,
            caption,
        });
        res.status(201).json(newPost);
    }
    catch (error) {
        console.error("Create post error:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.createPost = createPost;
const getUserPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.params;
        const posts = yield postsService.getUserPostsService(username);
        if (!posts) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }
        res.json(posts);
    }
    catch (error) {
        console.error("Ошибка при получении постов:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});
exports.getUserPosts = getUserPosts;
const getPostByIdController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.postId;
        const post = yield postsService.getPostByIdService(postId);
        if (!post)
            return res.status(404).json({ message: "Пост не найден" });
        res.json(post);
    }
    catch (error) {
        console.error("Ошибка получения поста с комментариями:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});
exports.getPostByIdController = getPostByIdController;
const getExplorePosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield postsService.getExplorePostsService();
        res.json(posts);
    }
    catch (error) {
        console.error("Error in getExplorePosts:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getExplorePosts = getExplorePosts;
const likePostController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId } = req.params;
        const userId = req.user._id;
        const likesCount = yield postsService.likePost(postId, userId);
        res.json({ likesCount });
    }
    catch (err) {
        console.error("LIKE controller error:", err);
        if (err instanceof Error) {
            res
                .status(500)
                .json({ message: "Ошибка при лайке поста", error: err.message });
        }
        else {
            res.status(500).json({ message: "Неизвестная ошибка при лайке поста" });
        }
    }
});
exports.likePostController = likePostController;
const unlikePostController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId } = req.params;
        const userId = req.user._id;
        const likesCount = yield postsService.unlikePost(postId, userId);
        res.status(200).json({ likes: likesCount });
    }
    catch (err) {
        console.error("Ошибка в unlikePostController:", err);
        res.status(500).json({ message: "Ошибка при удалении лайка" });
    }
});
exports.unlikePostController = unlikePostController;
const likeCommentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const likesCount = yield postsService.likeComment(req.params.commentId, req.user._id);
        res.status(200).json({ message: "Поставлен лайк", likesCount });
    }
    catch (error) {
        res.status(500).json({ message: "Ошибка сервера" });
    }
});
exports.likeCommentController = likeCommentController;
const unlikeCommentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const likesCount = yield postsService.unlikeComment(req.params.commentId, req.user._id);
        res.status(200).json({ message: "Лайк удалён", likesCount });
    }
    catch (error) {
        res.status(500).json({ message: "Ошибка сервера" });
    }
});
exports.unlikeCommentController = unlikeCommentController;
const deletePostController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId } = req.params;
        const userId = req.user._id;
        const success = yield postsService.deletePost(postId, userId);
        if (!success) {
            return res.status(403).json({ message: "Нет прав на удаление поста" });
        }
        res.status(200).json({ message: "Пост удалён" });
    }
    catch (error) {
        console.error("Ошибка при удалении поста:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});
exports.deletePostController = deletePostController;
const editPostController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId } = req.params;
        const { caption } = req.body;
        const userId = req.user._id;
        const updatedPost = yield postsService.editPost(postId, caption, userId);
        if (!updatedPost) {
            return res.status(403).json({ message: "Нет доступа к редактированию" });
        }
        res.json(updatedPost);
    }
    catch (error) {
        console.error("Ошибка при редактировании поста:", error);
        res.status(500).json({ message: "Ошибка при редактировании поста" });
    }
});
exports.editPostController = editPostController;
function getFeedPostsController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.user._id;
            const feedPosts = yield postsService.getFeedPostsService(userId);
            res.status(200).json(feedPosts);
        }
        catch (error) {
            console.error("Ошибка в getFeedPostsController:", error);
            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            }
            else {
                res.status(500).json({ message: "Server error" });
            }
        }
    });
}
const createCommentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId } = req.params;
        const authorId = String(req.user._id);
        const { text } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Text is required" });
        }
        const comment = yield postsService.createComment(postId, authorId, text);
        res.status(201).json(comment);
    }
    catch (error) {
        console.error("Create comment error:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.createCommentController = createCommentController;
