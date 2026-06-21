"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analytics = exports.db = exports.auth = exports.app = void 0;
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
const firestore_1 = require("firebase/firestore");
const analytics_1 = require("firebase/analytics");
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};
// Initialize Firebase for SSR and Client Side
console.log("[Firebase Client] Config apiKey:", firebaseConfig.apiKey ? "FOUND" : "MISSING");
console.log("[Firebase Client] Config projectId:", firebaseConfig.projectId);
const app = (0, app_1.getApps)().length === 0 ? (0, app_1.initializeApp)(firebaseConfig) : (0, app_1.getApp)();
exports.app = app;
const auth = (0, auth_1.getAuth)(app);
exports.auth = auth;
const db = (0, firestore_1.getFirestore)(app);
exports.db = db;
console.log("[Firebase Client] Firestore DB instance created:", !!db);
// Analytics is only initialized on client-side
let analytics = null;
exports.analytics = analytics;
if (typeof window !== "undefined") {
    (0, analytics_1.isSupported)().then((yes) => {
        if (yes) {
            exports.analytics = analytics = (0, analytics_1.getAnalytics)(app);
        }
    });
}
