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
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../db/User"));
const HttpExeption_1 = __importDefault(require("../utils/HttpExeption"));
const JWT_SECRET = process.env.JWT_SECRET;
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { authorization } = req.headers;
    if (!authorization) {
        return next((0, HttpExeption_1.default)(401, "Authorization header missing"));
    }
    const [bearer, token] = authorization.split(" ");
    if (bearer !== "Bearer" || !token) {
        return next((0, HttpExeption_1.default)(401, "Invalid authorization format"));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (typeof decoded !== "object" || decoded === null || !("id" in decoded)) {
            return next((0, HttpExeption_1.default)(401, "Invalid token payload"));
        }
        const payload = decoded;
        const user = yield User_1.default.findById(payload.id);
        if (!user || !user.token || user.token !== token) {
            return next((0, HttpExeption_1.default)(401, "User not found or token mismatch"));
        }
        req.user = user;
        next();
    }
    catch (error) {
        return next((0, HttpExeption_1.default)(401, error.message || "Unauthorized"));
    }
});
exports.authenticate = authenticate;
