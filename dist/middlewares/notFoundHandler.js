"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notFoundHandler = (req, res) => {
    res.status(404).json({
        message: `${req.url} not found`,
    });
};
exports.default = notFoundHandler;
