"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUserDto = void 0;
const toUserDto = (user) => ({
    _id: user._id.toString(),
    email: user.email,
    fullname: user.fullname,
    username: user.username,
    followers: user.followers,
    following: user.following,
    token: user.token,
    avatarUrl: user.avatarUrl,
});
exports.toUserDto = toUserDto;
