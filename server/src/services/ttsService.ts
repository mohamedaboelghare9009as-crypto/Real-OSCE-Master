// google-tts-api removed
import { Response } from 'express';
import https from 'https';

export class TTSService {
    private client: any;

    constructor() {
        // Client will auto-load credentials from GOOGLE_APPLICATION_CREDENTIALS
        try {
            const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
            this.client = new TextToSpeechClient();
        } catch (e) {
            console.error("Failed to initialize Google TTS Client", e);
        }
    }

    /**
     * Synthesize speech using Google Cloud TTS (SSML supported)
     * NOTE: Journey/Generative voices do NOT support SSML, only Standard/WaveNet
     */
    async synthesize(textOrSsml: string, voiceId: string, speed: number = 1.0, pitch: number = 0.0, isSsml: boolean = false): Promise<string> {
        if (!this.client) {
            console.warn("[TTS] Client not initialized - returning silent audio.");
            // Return 1 second of silence (minimal valid MP3)
            return "data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq";
        }

        // Journey voices do NOT support SSML - strip tags and use plain text
        const isJourneyVoice = voiceId.includes('Journey') || voiceId.includes('Generative');
        let inputContent = textOrSsml;
        let useSSML = isSsml;

        if (isJourneyVoice && isSsml) {
            // Strip SSML tags for Journey voices
            inputContent = textOrSsml
                .replace(/<speak>|<\/speak>/gi, '')
                .replace(/<prosody[^>]*>/gi, '')
                .replace(/<\/prosody>/gi, '')
                .replace(/<break[^>]*\/>/gi, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            useSSML = false;
            console.log(`[TTS] Journey voice detected - stripped SSML: "${inputContent}"`);
        }

        const request: any = {
            input: useSSML ? { ssml: inputContent } : { text: inputContent },
            voice: { languageCode: 'en-US', name: voiceId },
            audioConfig: {
                audioEncoding: 'MP3',
                // Only provide these if NOT using SSML
                ...(useSSML ? {} : { speakingRate: speed, pitch: pitch })
            },
        };

        try {
            console.log(`[TTS] Request: ${JSON.stringify(request)}`);
            const [response] = await this.client.synthesizeSpeech(request);
            if (!response.audioContent) throw new Error("No audio content received");

            // Convert to Base64 to return as data URL
            const audioBase64 = response.audioContent.toString('base64');
            return `data:audio/mp3;base64,${audioBase64}`;
        } catch (error: any) {
            console.error("GCP TTS Error:", error);
            // Fallback to silence on error too
            return "data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq";
        }
    }

    // Legacy stream helper (adapted to write to res)
    async streamAudio(textOrSsml: string, res: Response, voiceId: string = 'en-US-Journey-D', isSsml: boolean = false) {
        try {
            // Since GCP TTS returns a single buffer, we'll generate and send.
            const dataUrl = await this.synthesize(textOrSsml, voiceId, 1.0, 0.0, isSsml);
            const base64 = dataUrl.split(',')[1];
            const buffer = Buffer.from(base64, 'base64');

            res.setHeader('Content-Type', 'audio/mpeg');
            res.send(buffer);
        } catch (e: any) {
            console.error("Stream Audio Error:", e);
            if (!res.headersSent) res.status(500).json({ error: e.message });
        }
    }
}

export const ttsService = new TTSService();
