"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_1 = require("../firebase");
const firestore_1 = require("firebase/firestore");
async function test() {
    try {
        const querySnap = await (0, firestore_1.getDocs)((0, firestore_1.collection)(firebase_1.db, 'complaints'));
        console.log(`[Test Firestore] Total complaints documents: ${querySnap.size}`);
        querySnap.forEach(doc => {
            console.log(` - ID: ${doc.id}, Category: ${doc.data().category}, CreatedAt: ${doc.data().createdAt}`);
        });
    }
    catch (err) {
        console.error(`[Test Firestore] Error:`, err.message);
    }
}
test();
