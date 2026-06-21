"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppUrl = getAppUrl;
exports.generateTrackingToken = generateTrackingToken;
exports.getBackendUrl = getBackendUrl;
exports.getBackendAppUrl = getBackendAppUrl;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../frontend/.env') });
function getAppUrl() {
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }
    if (process.env.NEXT_PUBLIC_NGROK_PUBLIC_URL) {
        return process.env.NEXT_PUBLIC_NGROK_PUBLIC_URL;
    }
    if (process.env.NGROK_PUBLIC_URL) {
        return process.env.NGROK_PUBLIC_URL;
    }
    return 'http://localhost:3000';
}
function generateTrackingToken() {
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}
function getBackendUrl() {
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }
    return `http://localhost:${process.env.PORT || '5002'}`;
}
function getBackendAppUrl() {
    return getAppUrl();
}
