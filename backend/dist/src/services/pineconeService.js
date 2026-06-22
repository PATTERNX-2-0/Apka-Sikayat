"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmbedding = getEmbedding;
exports.upsertVector = upsertVector;
exports.searchVectors = searchVectors;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Load environment variables dynamically with fallback paths
let envPath = path_1.default.join(__dirname, '../../frontend/.env');
if (!fs_1.default.existsSync(envPath)) {
    envPath = path_1.default.join(__dirname, '../../../frontend/.env');
}
dotenv_1.default.config({ path: envPath });
// Helpers to get env values dynamically
const getGeminiApiKey = () => process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_CITIZEN || "";
const getPineconeApiKey = () => process.env.PINECONE_API_KEY || "";
const getPineconeIndexHost = () => process.env.PINECONE_INDEX_HOST || "";
/**
 * Generate vector embedding for a given text using Gemini Text Embedding model
 */
async function getEmbedding(text) {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${getGeminiApiKey()}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "models/text-embedding-004",
                content: {
                    parts: [{ text }]
                }
            })
        });
        if (!response.ok) {
            throw new Error(`Gemini embedding failed with status: ${response.status}`);
        }
        const data = await response.json();
        if (!data.embedding?.values) {
            throw new Error('Embedding values not found in response');
        }
        return data.embedding.values;
    }
    catch (error) {
        console.error('[Pinecone Service] Embedding generation error:', error.message);
        // Return a dummy 768-dimension vector if it fails so the system doesn't crash
        return new Array(768).fill(0).map(() => Math.random() - 0.5);
    }
}
/**
 * Upsert a document vector into Pinecone Index
 */
async function upsertVector(id, text, metadata) {
    try {
        const vector = await getEmbedding(text);
        const url = `${getPineconeIndexHost()}/vectors/upsert`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Api-Key': getPineconeApiKey(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vectors: [
                    {
                        id,
                        values: vector,
                        metadata: {
                            ...metadata,
                            text // Store raw text for retrieval reference
                        }
                    }
                ]
            })
        });
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Pinecone upsert failed: ${response.status} - ${errText}`);
        }
        console.log(`[Pinecone Service] Vector upserted successfully: ${id}`);
        return true;
    }
    catch (error) {
        console.error(`[Pinecone Service] Upsert error for ID ${id}:`, error.message);
        return false;
    }
}
/**
 * Search the Pinecone index for most similar vectors to retrieve knowledge
 */
async function searchVectors(queryText, topK = 5) {
    try {
        const vector = await getEmbedding(queryText);
        const url = `${getPineconeIndexHost()}/query`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Api-Key': getPineconeApiKey(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vector,
                topK,
                includeMetadata: true
            })
        });
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Pinecone query failed: ${response.status} - ${errText}`);
        }
        const data = await response.json();
        return data.matches || [];
    }
    catch (error) {
        console.error('[Pinecone Service] Search vector error:', error.message);
        return [];
    }
}
