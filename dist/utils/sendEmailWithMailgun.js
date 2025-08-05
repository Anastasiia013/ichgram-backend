"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const form_data_1 = __importDefault(require("form-data"));
const mailgun_js_1 = __importDefault(require("mailgun.js"));
require("dotenv/config");
const { MAILGUN_API_KEY, MAILGUN_DOMAIN } = process.env;
const mailgun = new mailgun_js_1.default(form_data_1.default);
const mg = mailgun.client({ username: "api", key: MAILGUN_API_KEY });
const sendEmailWitMailgun = (data) => {
    const email = Object.assign(Object.assign({}, data), { from: `Excited User <mailgun@${MAILGUN_DOMAIN}>` });
    return mg.messages.create(MAILGUN_DOMAIN, email);
};
exports.default = sendEmailWitMailgun;
