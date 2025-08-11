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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unfollowUserController = exports.followUserController = exports.searchUserController = exports.resetPasswordController = exports.changePasswordController = exports.updateUserProfileController = exports.getUserByIdController = exports.getUserProfileController = exports.verifyController = exports.checkUsernameController = exports.checkEmailController = exports.registerUserController = void 0;
const usersService = __importStar(require("../services/user.service"));
const validateBody_1 = __importDefault(require("../utils/validateBody"));
const users_schema_1 = require("../validation/users.schema");
const registerUserController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, validateBody_1.default)(users_schema_1.userAddSchema, req.body);
    yield usersService.registerUser(req.body);
    res.status(201).json({
        message: "User succeffully register. Please confirm email with link",
    });
});
exports.registerUserController = registerUserController;
const checkEmailController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.query;
    if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Email is required" });
    }
    const exists = yield usersService.checkEmailExists(email);
    res.json({ exists });
});
exports.checkEmailController = checkEmailController;
const checkUsernameController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.query;
    if (!username || typeof username !== "string") {
        return res.status(400).json({ message: "Username is required" });
    }
    const exists = yield usersService.checkUsernameExists(username);
    res.json({ exists });
});
exports.checkUsernameController = checkUsernameController;
const verifyController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, validateBody_1.default)(users_schema_1.verifyCodeSchema, req.body);
    yield usersService.verify(req.body.code);
    res.status(200).json({
        message: "User successfully verified",
    });
});
exports.verifyController = verifyController;
const getUserProfileController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const username = req.params.username;
        const user = yield usersService.getUserProfileService(username);
        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }
        return res.json(user);
    }
    catch (error) {
        console.error("Ошибка при получении профиля:", error);
        return res.status(500).json({ message: "Ошибка сервера" });
    }
});
exports.getUserProfileController = getUserProfileController;
const getUserByIdController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const user = yield usersService.getUserByIdService(userId);
        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }
        res.json(user);
    }
    catch (error) {
        console.error("Ошибка при получении пользователя по ID:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});
exports.getUserByIdController = getUserByIdController;
const updateUserProfileController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fullname, bio, link } = req.body;
        const avatarUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
        const updatedFields = { fullname, bio, link };
        if (avatarUrl) {
            updatedFields.avatarUrl = avatarUrl;
        }
        const user = yield usersService.updateUserProfile(req.user.id, updatedFields);
        res.json(user);
    }
    catch (err) {
        console.error("Ошибка при обновлении профиля:", err);
        res.status(500).json({ message: "Ошибка при обновлении профиля" });
    }
});
exports.updateUserProfileController = updateUserProfileController;
const changePasswordController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { identifier } = req.body;
    try {
        yield usersService.sendPasswordResetLink(identifier);
        res
            .status(200)
            .json({ message: "Reset link sent to email if user exists" });
    }
    catch (error) {
        next(error);
    }
});
exports.changePasswordController = changePasswordController;
const resetPasswordController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, validateBody_1.default)(users_schema_1.resetPasswordSchema, req.body);
        const { verificationCode, newPassword } = req.body;
        yield usersService.resetPasswordByCode(verificationCode, newPassword);
        res.status(200).json({ message: "Password successfully reset" });
    }
    catch (error) {
        next(error);
    }
});
exports.resetPasswordController = resetPasswordController;
const searchUserController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { q } = req.query;
        if (!q || typeof q !== "string") {
            return res.status(400).json({ message: "Query is required" });
        }
        const users = yield usersService.searchUsers(q);
        res.json(users);
    }
    catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.searchUserController = searchUserController;
const followUserController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const currentUserId = req.user._id;
        yield usersService.followUser(id, currentUserId);
        res.status(200).json({ message: "Подписка оформлена" });
    }
    catch (error) {
        const status = error.message === "Нельзя подписаться на себя" ? 400 : 404;
        res.status(status).json({ message: error.message });
    }
});
exports.followUserController = followUserController;
const unfollowUserController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const currentUserId = req.user._id;
        yield usersService.unfollowUser(id, currentUserId);
        res.status(200).json({ message: "Отписка выполнена" });
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
});
exports.unfollowUserController = unfollowUserController;
