"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const users_constants_1 = require("../constants/users.constants");
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        unique: true,
        match: users_constants_1.emailValidation.value,
        required: true,
    },
    fullname: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    token: String,
    verificationCode: String,
    verify: {
        type: Boolean,
        default: false,
        required: true,
    },
    bio: {
        type: String,
        default: "",
    },
    link: {
        type: String,
        default: "",
    },
    avatarUrl: {
        type: String,
        default: "",
    },
    followers: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
            default: [],
        },
    ],
    following: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
            default: [],
        },
    ],
}, {
    versionKey: false,
    timestamps: true,
});
const User = (0, mongoose_1.model)("User", userSchema);
exports.default = User;
