
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const DEEPINFRA_TOKEN = process.env.DEEPINFRA_TOKEN;

async function registerVoice(audioPath: string, name: string, description: string) {
    if (!DEEPINFRA_TOKEN) {
        console.error("Error: DEEPINFRA_TOKEN not found in .env");
        return;
    }

    if (!fs.existsSync(audioPath)) {
        console.error(`Error: Audio file not found at ${audioPath}`);
        return;
    }

    console.log(`[DeepInfra] Registering custom voice: "${name}"...`);

    const url = 'https://api.deepinfra.com/v1/voices/add';

    try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);

        const audioBuffer = fs.readFileSync(audioPath);
        const fileName = path.basename(audioPath);
        const blob = new Blob([audioBuffer], { type: 'audio/wav' });
        formData.append('audio', blob, fileName);

        const response = await axios.post(url, formData, {
            headers: {
                'Authorization': `Bearer ${DEEPINFRA_TOKEN}`
            }
        });

        console.log("\n✅ VOICE CREATED SUCCESSFULLY!");
        console.log("----------------------------");
        console.log(`Voice ID:    ${response.data.voice_id}`);
        console.log(`Name:        ${response.data.name}`);
        console.log(`Description: ${response.data.description}`);
        console.log("----------------------------");
        console.log(`\nYou can now use this Voice ID in your case data or 'forceVoice' options.`);

    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            console.error(`\n❌ ERROR: ${error.response?.status}`);
            console.error(JSON.stringify(error.response?.data, null, 2));
        } else {
            console.error("\n❌ ERROR:", error.message);
        }
    }
}

// Get args from command line
// Usage: ts-node register-voice.ts <path_to_audio> <voice_name> <description>
const args = process.argv.slice(2);
if (args.length < 2) {
    console.log("Usage: npx ts-node register-voice.ts <path_to_audio> <voice_name> [description]");
    process.exit(1);
}

const audioPath = path.isAbsolute(args[0]) ? args[0] : path.join(process.cwd(), args[0]);
const voiceName = args[1];
const description = args[2] || `${voiceName}'s custom voice`;

registerVoice(audioPath, voiceName, description);
