"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppUrl = getAppUrl;
exports.generateTrackingToken = generateTrackingToken;
exports.generateNextComplaintId = generateNextComplaintId;
exports.getBackendUrl = getBackendUrl;
exports.getBackendAppUrl = getBackendAppUrl;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
let envPath = path_1.default.join(__dirname, '../../frontend/.env');
if (!fs_1.default.existsSync(envPath)) {
    envPath = path_1.default.join(__dirname, '../../../frontend/.env');
}
dotenv_1.default.config({ path: envPath });
function getAppUrl() {
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }
    if (process.env.NEXT_PUBLIC_API_URL) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL.trim();
        if (apiUrl.includes('apka-sikayat') && apiUrl.includes('onrender.com')) {
            return 'https://apka-sikayat.vercel.app';
        }
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
async function generateNextComplaintId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    try {
        const { db } = require('../../firebase');
        const { collection, getDocs } = require('firebase/firestore');
        const complaintsRef = collection(db, 'complaints');
        const snap = await getDocs(complaintsRef);
        let maxNum = 0;
        snap.forEach((doc) => {
            const id = doc.id;
            if (id.startsWith(`CMP-${dateStr}-`)) {
                const numPart = parseInt(id.split('-')[2], 10);
                if (!isNaN(numPart) && numPart > maxNum) {
                    maxNum = numPart;
                }
            }
        });
        if (maxNum === 0) {
            return `CMP-${dateStr}-1001`;
        }
        const nextNum = (maxNum + 1).toString();
        return `CMP-${dateStr}-${nextNum}`;
    }
    catch (err) {
        console.error('Error generating complaint ID:', err);
        const randNum = Math.floor(1000 + Math.random() * 9000).toString();
        return `CMP-${dateStr}-${randNum}`;
    }
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
