"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const notFoundHandler_1 = __importDefault(require("./middlewares/notFoundHandler"));
const errorHandler_1 = __importDefault(require("./middlewares/errorHandler"));
const user_router_1 = __importDefault(require("./routes/user.router"));
const auth_router_1 = __importDefault(require("./routes/auth.router"));
const posts_router_1 = __importDefault(require("./routes/posts.router"));
const startServer = () => {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../public/uploads")));
    app.use("/api/users", user_router_1.default);
    app.use("/api/auth", auth_router_1.default);
    app.use("/api/posts", posts_router_1.default);
    app.use(notFoundHandler_1.default);
    app.use(errorHandler_1.default);
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server running on ${port} port`));
};
exports.default = startServer;
