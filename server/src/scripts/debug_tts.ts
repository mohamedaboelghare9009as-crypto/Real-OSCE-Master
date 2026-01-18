
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const testTTS = async () => {
    try {
        console.log("Testing TTS Endpoint directly...");
        const response = await axios.post('http://localhost:3001/api/tts', {
            text: "This is a test of the emergency broadcast system.",
            gender: "Female"
        });

        if (response.data.audioContent) {
            console.log("✅ TTS Success! Received audioContent length:", response.data.audioContent.length);
            // Optional: Write to file to verify
            const buffer = Buffer.from(response.data.audioContent, 'base64');
            fs.writeFileSync(path.resolve(__dirname, 'test_output.mp3'), buffer);
            console.log("Saved test_output.mp3");
        } else {
            console.error("❌ TTS Failed: No audioContent in response", response.data);
        }

    } catch (error: any) {
        console.error("❌ TTS Request Error:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        }
    }
};

testTTS();
