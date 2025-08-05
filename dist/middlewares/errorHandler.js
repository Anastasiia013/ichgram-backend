"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = (error, _req, res, _next) => {
    const { status = 500, message } = error;
    res.status(status).json({ message });
};
exports.default = errorHandler;
