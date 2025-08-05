"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVerificationCode = void 0;
const generateVerificationCode = () => {
    const length = 40;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};
exports.generateVerificationCode = generateVerificationCode;
