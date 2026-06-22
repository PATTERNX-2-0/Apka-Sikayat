const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '../frontend/.env');
dotenv.config({ path: envPath });

const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_CITIZEN || "";
console.log("Using API Key:", apiKey);

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
const requestBody = {
  contents: [
    {
      parts: [{ text: "Hello, respond with 'Success' if you can read this." }]
    }
  ]
};

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(requestBody)
})
.then(res => {
  console.log("Response status:", res.status);
  return res.json();
})
.then(data => {
  console.log("Response data:", JSON.stringify(data, null, 2));
})
.catch(err => {
  console.error("Error:", err);
});
