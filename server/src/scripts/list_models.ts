
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API Key found.");
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // List models is not directly exposed on genAI usually in this library
        // but it's available via the models object usually or similar.
        // Actually, let's just try to fetch some metadata.
        console.log("Attempting to list models...");
        // This specific library doesn't easily expose listModels in a standard way without lower level calls.

        // I'll try gemini-1.5-flash-001 which is very specific.
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent("test");
        console.log("Success with gemini-1.5-flash-001");
    } catch (e: any) {
        console.error("Failed:", e.message || e);
    }
}

listModels();
