const { VertexAI } = require('@google-cloud/vertexai');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const keyPath = path.resolve(__dirname, '../../../osce-ai-sim-d5b457979ae1.json');
process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;

async function testAuth() {
    console.log("Key Path:", keyPath);
    console.log("Exists:", fs.existsSync(keyPath));
    console.log("GOOGLE_APPLICATION_CREDENTIALS:", process.env.GOOGLE_APPLICATION_CREDENTIALS);

    const project = 'osce-ai-sim';
    const location = 'us-central1';

    try {
        const vertexAI = new VertexAI({ project, location });
        const model = vertexAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

        console.log("Testing model.generateContent...");
        const result = await model.generateContent("Say hello");
        const response = result.response.candidates[0].content.parts[0].text;
        console.log("AI Response:", response);
    } catch (err) {
        console.error("AI TEST FAILED:", err);
    }
}

testAuth();
