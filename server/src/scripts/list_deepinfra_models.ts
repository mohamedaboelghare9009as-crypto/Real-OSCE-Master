
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function listDeepInfraModels() {
    const token = process.env.DEEPINFRA_TOKEN;
    if (!token) {
        console.error("DEEPINFRA_TOKEN not found in .env");
        return;
    }

    try {
        console.log("Fetching DeepInfra models...");
        const response = await axios.get('https://api.deepinfra.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        // DeepInfra's /v1/models might return an object with a 'data' array or a direct array
        // Let's inspect the keys if it's not an array
        let models = response.data;
        if (!Array.isArray(models)) {
            console.log("Response is not an array. Keys:", Object.keys(models));
            if (models.data && Array.isArray(models.data)) {
                models = models.data;
            } else {
                console.log("Full Response:", JSON.stringify(models, null, 2));
                return;
            }
        }

        console.log(`Available Models (${models.length} total):`);

        const ttsModels = models.filter((m: any) =>
            m.type === 'text-to-speech' ||
            (m.metadata && m.metadata.tags && m.metadata.tags.includes('tts'))
        );

        if (ttsModels.length > 0) {
            console.log("\nFound TTS Models:");
            ttsModels.forEach((m: any) => console.log(`- ID: ${m.id} | Name: ${m.model_name || m.name || 'N/A'}`));
        } else {
            console.log("\nNo TTS models found specifically by type 'text-to-speech'. Printing first 20 model IDs for inspection:");
            models.slice(0, 20).forEach((m: any) => console.log(`- ID: ${m.id}`));
        }

    } catch (e: any) {
        console.error("Failed to fetch models:", e.message);
        if (e.response) console.error(e.response.data);
    }
}

listDeepInfraModels();
