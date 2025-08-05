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
exports.logout = exports.getCurrent = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../db/User"));
const HttpExeption_1 = __importDefault(require("../utils/HttpExeption"));
const toUserDto_1 = require("../typescript/toUserDto");
const { JWT_SECRET = "devsecret" } = process.env;
const createToken = (user) => {
    const payload = {
        id: user.id.toString(),
    };
    const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        expiresIn: "24h",
    });
    return token;
};
const login = (_a) => __awaiter(void 0, [_a], void 0, function* ({ identifier, password, }) {
    const user = (yield User_1.default.findOne({
        $or: [{ email: identifier }, { username: identifier }],
    }));
    if (!user) {
        throw (0, HttpExeption_1.default)(401, `User with identifier ${identifier} not exist`);
    }
    if (!user.verify) {
        throw (0, HttpExeption_1.default)(403, "Please verify your email before logging in");
    }
    const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw (0, HttpExeption_1.default)(401, "Password invalid");
    }
    const token = createToken(user);
    user.token = token;
    yield user.save();
    return {
        token,
        user: (0, toUserDto_1.toUserDto)(user),
    };
});
exports.login = login;
const getCurrent = (user) => __awaiter(void 0, void 0, void 0, function* () {
    return {
        token: user.token,
        user: (0, toUserDto_1.toUserDto)(user),
    };
});
exports.getCurrent = getCurrent;
const logout = (_a) => __awaiter(void 0, [_a], void 0, function* ({ _id }) {
    const user = (yield User_1.default.findById(_id));
    if (!user) {
        throw (0, HttpExeption_1.default)(401, `User not found`);
    }
    user.token = "";
    yield user.save();
});
exports.logout = logout;
