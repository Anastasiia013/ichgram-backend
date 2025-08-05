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
exports.unfollowUser = exports.followUser = exports.searchUsers = exports.updateUserProfile = exports.getUserByIdService = exports.getUserProfileService = exports.resetPasswordByCode = exports.sendPasswordResetLink = exports.verify = exports.checkUsernameExists = exports.checkEmailExists = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../db/User"));
const sendEmailWithMailgun_1 = __importDefault(require("../utils/sendEmailWithMailgun"));
const HttpExeption_1 = __importDefault(require("../utils/HttpExeption"));
const nanoid_1 = require("nanoid");
const generateVerificationCode_1 = require("../utils/generateVerificationCode");
const { FRONTEND_URL } = process.env;
const registerUser = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, fullname, username, password } = data;
    const userByEmail = yield User_1.default.findOne({ email });
    if (userByEmail)
        throw (0, HttpExeption_1.default)(409, `Email ${email} is already registered`);
    const userByUsername = yield User_1.default.findOne({ username });
    if (userByUsername)
        throw (0, HttpExeption_1.default)(409, `Username ${username} is already taken`);
    const hashPassword = yield bcrypt_1.default.hash(password, 10);
    const verificationCode = (0, nanoid_1.nanoid)();
    const newUser = yield User_1.default.create(Object.assign(Object.assign({}, data), { password: hashPassword, verificationCode }));
    const verifyEmail = {
        to: [email],
        subject: "Verify your email on Ichgram",
        html: `<a href="${FRONTEND_URL}?verificationCode=${verificationCode}" target="_blank">Click to verify your email adress on Ichgram</a>`,
    };
    yield (0, sendEmailWithMailgun_1.default)(verifyEmail);
    return newUser;
});
exports.registerUser = registerUser;
const checkEmailExists = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findOne({ email });
    return !!user;
});
exports.checkEmailExists = checkEmailExists;
const checkUsernameExists = (username) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findOne({ username });
    return !!user;
});
exports.checkUsernameExists = checkUsernameExists;
const verify = (code) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findOne({ verificationCode: code });
    if (!user)
        throw (0, HttpExeption_1.default)(401, "Email already verified or not found");
    user.verificationCode = "";
    user.verify = true;
    yield user.save();
});
exports.verify = verify;
const sendPasswordResetLink = (identifier) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findOne({
        $or: [{ email: identifier }, { username: identifier }],
    });
    if (!user) {
        throw (0, HttpExeption_1.default)(404, `User with identifier "${identifier}" not found`);
    }
    const verificationCode = (0, generateVerificationCode_1.generateVerificationCode)();
    user.verificationCode = verificationCode;
    yield user.save();
    const emailData = {
        to: [user.email],
        subject: "Reset your Ichgram password",
        html: `<p>Click the link below to reset your password:</p>
           <a href="${FRONTEND_URL}/reset-password?verificationCode=${verificationCode}" target="_blank">
             Reset Password
           </a>`,
    };
    yield (0, sendEmailWithMailgun_1.default)(emailData);
});
exports.sendPasswordResetLink = sendPasswordResetLink;
const resetPasswordByCode = (verificationCode, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findOne({ verificationCode });
    if (!user) {
        throw (0, HttpExeption_1.default)(400, "Invalid or expired verification code");
    }
    const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
    user.password = hashedPassword;
    user.verificationCode = ""; // одноразовый код сбрасываем
    yield user.save();
});
exports.resetPasswordByCode = resetPasswordByCode;
const getUserProfileService = (username) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findOne({ username })
        .select("-password -verificationCode -token -__v") // скрываем лишнее
        .populate("followers", "username avatarUrl") // получить краткую инфу о подписчиках
        .populate("following", "username avatarUrl");
    return user;
});
exports.getUserProfileService = getUserProfileService;
const getUserByIdService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield User_1.default.findById(userId)
        .select("-password -verificationCode -token -__v")
        .populate("followers", "username avatarUrl")
        .populate("following", "username avatarUrl");
});
exports.getUserByIdService = getUserByIdService;
const updateUserProfile = (userId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    return yield User_1.default.findByIdAndUpdate(userId, updateData, {
        new: true,
    }).select("-password");
});
exports.updateUserProfile = updateUserProfile;
const searchUsers = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const regex = new RegExp(query, "i");
    const users = yield User_1.default.find({
        $or: [{ username: regex }, { fullname: regex }],
    }).select("_id username fullname avatarUrl");
    return users;
});
exports.searchUsers = searchUsers;
const followUser = (targetUserId, currentUserId) => __awaiter(void 0, void 0, void 0, function* () {
    if (targetUserId === currentUserId) {
        throw new Error("Нельзя подписаться на себя");
    }
    const user = yield User_1.default.findById(targetUserId);
    const currentUser = yield User_1.default.findById(currentUserId);
    if (!user || !currentUser) {
        throw new Error("Пользователь не найден");
    }
    if (!user.followers.some((id) => id.toString() === currentUserId)) {
        user.followers.push(currentUserId);
    }
    if (!currentUser.following.some((id) => id.toString() === targetUserId)) {
        currentUser.following.push(targetUserId);
    }
    yield Promise.all([user.save(), currentUser.save()]);
    return user;
});
exports.followUser = followUser;
const unfollowUser = (targetUserId, currentUserId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findById(targetUserId);
    const currentUser = yield User_1.default.findById(currentUserId);
    if (!user || !currentUser) {
        throw new Error("Пользователь не найден");
    }
    user.followers = user.followers.filter((followerId) => followerId.toString() !== currentUserId.toString());
    currentUser.following = currentUser.following.filter((followingId) => followingId.toString() !== targetUserId.toString());
    yield Promise.all([user.save(), currentUser.save()]);
    return user;
});
exports.unfollowUser = unfollowUser;
