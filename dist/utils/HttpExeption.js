"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const classes_1 = require("../typescript/classes");
const messageList = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    409: "Conflict",
    500: "Server error"
};
const HttpExeption = (status, message = messageList[status]) => {
    const error = new classes_1.HttpError(message);
    error.status = status;
    return error;
};
exports.default = HttpExeption;
