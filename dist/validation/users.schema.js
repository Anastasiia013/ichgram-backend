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
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.verifyCodeSchema = exports.userAddSchema = exports.usernameSchema = exports.emailSchema = exports.resetPasswordSchema = exports.passwordSchema = void 0;
const Yup = __importStar(require("yup"));
const users_constants_1 = require("../constants/users.constants");
//проверка пароля
exports.passwordSchema = Yup.string()
    .trim()
    .min(6)
    .matches(users_constants_1.passwordValidation.value, users_constants_1.passwordValidation.message)
    .required();
exports.resetPasswordSchema = Yup.object().shape({
    verificationCode: Yup.string().required("Verification code is required"),
    newPassword: Yup
        .string()
        .min(6, "Password must be at least 6 characters")
        .required("New password is required"),
});
//проверка имейл
exports.emailSchema = Yup.string()
    .trim()
    .matches(users_constants_1.emailValidation.value, users_constants_1.emailValidation.message)
    .required();
exports.usernameSchema = Yup.string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores");
//проверка данных пользователя
exports.userAddSchema = Yup.object({
    fullname: Yup.string().trim().required(),
    username: exports.usernameSchema,
    email: exports.emailSchema,
    password: exports.passwordSchema,
});
exports.verifyCodeSchema = Yup.object({
    code: Yup.string().trim().required(),
});
exports.changePasswordSchema = Yup.object({
    oldPassword: exports.passwordSchema,
    newPassword: exports.passwordSchema,
});
