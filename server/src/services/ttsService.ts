import { connectionManager } from './connectionManager';
import axios from 'axios'; // For reliable HTTP requests
import { Response } from 'express';
import * as dotenv from 'dotenv';
import {
    DeepInfraVoice,
    DEEPINFRA_VOICES,
    isValidVoiceId,
    getVoiceById,
    selectVoiceForPatient,
    getAdjustedParameters,
    PatientDemographics
} from '../voice/deepinfraChatterboxConfig';

dotenv.config();

export interface SynthesisOptions {
    voiceId?: string;
    exaggeration?: number;
    temperature?: number;
    cfg?: number; // Classifier-Free Guidance (0-1)
    top_p?: number;
    min_p?: number;
    repetition_penalty?: number;
    top_k?: number;
    responseFormat?: 'mp3' | 'wav' | 'opus' | 'flac' | 'pcm';
    insertVoiceTags?: boolean;
}

export interface SynthesisResult {
    audioDataUrl: string;
    voiceInfo: {
        voiceId: string;
        voiceName: string;
        exaggeration: number;
        temperature: number;
    };
}

export class TTSService {
    private readonly DEEPINFRA_URL = 'https://api.deepinfra.com/v1/inference/ResembleAI/chatterbox-turbo';
    private readonly DEEPINFRA_API_KEY: string;
    private readonly httpsAgent = connectionManager.getHttpsAgent();

    constructor() {
        this.DEEPINFRA_API_KEY = (process.env.DEEPINFRA_TOKEN || process.env.DEEPINFRA_API_KEY || '').trim();

        console.log(`[TTS] Initializing DeepInfra TTS Service...`);
        console.log(`[TTS] API Key present: ${this.DEEPINFRA_API_KEY ? 'YES' : 'NO'}`);

        if (!this.DEEPINFRA_API_KEY) {
            console.error('[TTS] CRITICAL: DEEPINFRA_TOKEN is not set!');
        } else {
            console.log(`[TTS] DeepInfra TTS Service initialized`);
            console.log(`[TTS] Available voices: ${Object.keys(DEEPINFRA_VOICES).length}`);
        }
    }

    async synthesize(
        text: string,
        voiceId: string = 'Britney',
        exaggeration: number = 0.5,
        temperature: number = 0.8,
        cfg: number = 0.5,
        responseFormat: 'mp3' | 'wav' | 'opus' | 'flac' | 'pcm' = 'wav',
        additionalParams: {
            top_p?: number;
            min_p?: number;
            repetition_penalty?: number;
            top_k?: number;
        } = {}
    ): Promise<string> {
        if (!this.DEEPINFRA_API_KEY) {
            throw new Error('TTS client not initialized. Check DEEPINFRA_TOKEN.');
        }

        if (!text || text.trim().length === 0) {
            throw new Error('Text cannot be empty');
        }

        // ... existing voice validation ...
        const normalizedVoiceId = Object.keys(DEEPINFRA_VOICES).find(
            key => key.toLowerCase() === voiceId.toLowerCase()
        ) || voiceId;

        // ... (keep usage of normalizedVoiceId/actualVoice/voice logic) ...

        const isPreset = normalizedVoiceId in DEEPINFRA_VOICES;
        const isUUID = /^[a-zA-Z0-9]{20,}$/.test(normalizedVoiceId);

        if (!isPreset && !isUUID) {
            console.warn(`[TTS] Invalid voice ID format "${voiceId}", falling back to Britney`);
            voiceId = 'Britney';
        } else {
            voiceId = normalizedVoiceId;
        }

        const voice = DEEPINFRA_VOICES[voiceId] || null;
        const actualVoice = voice?.voiceId || voiceId;

        console.log(`[TTS] Synthesizing: ${actualVoice} (${voice?.name || 'Custom'})`);

        const sanitizedText = text.replace(/"/g, "'");
        const hasParalinguisticTags = /\[(cough|laugh|sigh|chuckle|gasp|groan)\]/i.test(text);

        try {
            console.log(`[TTS] Synthesizing full text...`);
            const startTime = Date.now();

            const payload = {
                text: sanitizedText,
                voice_id: actualVoice,
                response_format: responseFormat
            };

            const response = await axios.post(this.DEEPINFRA_URL, payload, {
                headers: {
                    'Authorization': `Bearer ${this.DEEPINFRA_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                responseType: 'arraybuffer',
                timeout: 60000
                // httpsAgent: this.httpsAgent
            });

            const data = response.data;
            const firstByte = data[0];
            let audioBuffer: Buffer;

            // Check if response is JSON (starts with '{') - DeepInfra often wraps audio in JSON
            if (firstByte === 0x7b) {
                try {
                    const jsonStr = data.toString('utf8');
                    const json = JSON.parse(jsonStr);

                    if (json.audio && typeof json.audio === 'string') {
                        // Format is usually "data:audio/mp3;base64,..."
                        const base64 = json.audio.split(',')[1] || json.audio;
                        audioBuffer = Buffer.from(base64, 'base64');
                    } else {
                        console.warn('[TTS] JSON response missing "audio" field, using raw data');
                        audioBuffer = Buffer.from(data);
                    }
                } catch (e) {
                    console.warn('[TTS] Failed to parse JSON response, using raw data');
                    audioBuffer = Buffer.from(data);
                }
            } else {
                // Raw audio
                audioBuffer = Buffer.from(data);
            }

            console.log(`[TTS] Synthesis complete in ${Date.now() - startTime}ms. Generated ${audioBuffer.length} bytes.`);

            const mimeType = responseFormat === 'pcm' ? 'audio/pcm' : `audio/${responseFormat}`;
            return `data:${mimeType};base64,${audioBuffer.toString('base64')}`;

        } catch (error: any) {
            console.error(`[TTS] Sync Synthesis Error: ${error.message}`);
            if (axios.isAxiosError(error)) {
                let errorData = error.response?.data;
                if (Buffer.isBuffer(errorData)) errorData = errorData.toString('utf8');
                console.error(`[TTS] Inference API Error: ${error.response?.status} - ${JSON.stringify(errorData || error.message)}`);
                throw new Error(`TTS API Error: ${error.response?.status || error.message}`);
            }
            console.error(`[TTS] General Error: ${error.message}`);
            throw error;
        }
    }

    /**
     * STREAMING SYNTHESIS (Turbo Mode)
     * Pipes raw audio chunks back to the caller as they arrive from DeepInfra
     */
    /**
     * STREAMING SYNTHESIS (Turbo Mode - Parallel Sentence Stitching)
     * Splits text into sentences, requests them in parallel, and yields audio as soon as the next chunk is ready.
     * drastically reduces time-to-first-byte.
     */
    /**
     * STREAMING SYNTHESIS (Use One-Shot for Reliability)
     * Calls synthesize() once for the entire text and yields the result.
     * This avoids the overhead and potential failures of sentence-level parallel requests.
     */
    async * synthesizeStream(
        text: string,
        voiceId: string = 'Britney',
        exaggeration: number = 0.5,
        temperature: number = 0.8,
        cfg: number = 0.5,
        responseFormat: 'mp3' | 'wav' | 'pcm' = 'pcm',
        additionalParams: {
            top_p?: number;
            min_p?: number;
            repetition_penalty?: number;
            top_k?: number;
        } = {}
    ): AsyncIterable<Buffer> {
        if (!this.DEEPINFRA_API_KEY) throw new Error('TTS client not initialized');

        // Voice Resolution
        const normalizedVoiceId = Object.keys(DEEPINFRA_VOICES).find(
            key => key.toLowerCase() === voiceId.toLowerCase()
        ) || voiceId;
        const voice = DEEPINFRA_VOICES[normalizedVoiceId] || null;
        const actualVoice = voice?.voiceId || normalizedVoiceId;

        const sanitizedText = text.replace(/"/g, "'");
        console.log(`[TTS-STREAM] 🎙️ Starting streaming synthesis with ${responseFormat.toUpperCase()}`);
        console.log(`[TTS-STREAM] Voice: ${actualVoice}, Text length: ${text.length} chars`);

        const startTime = Date.now();

        try {
            const payload = {
                text: sanitizedText,
                voice_id: actualVoice,
                response_format: responseFormat
            };

            // TRUE STREAMING: responseType 'stream' returns chunks as they arrive
            const response = await axios.post(this.DEEPINFRA_URL, payload, {
                headers: {
                    'Authorization': `Bearer ${this.DEEPINFRA_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                responseType: 'stream', // ✅ KEY CHANGE: Stream chunks instead of buffering
                timeout: 60000
            });

            let totalBytes = 0;
            let firstChunkTime: number | null = null;

            // Yield chunks as they arrive from the network
            for await (const chunk of response.data) {
                if (!firstChunkTime) {
                    firstChunkTime = Date.now();
                    console.log(`[TTS-STREAM] ⚡ First chunk received in ${firstChunkTime - startTime}ms`);
                }

                totalBytes += chunk.length;
                yield Buffer.from(chunk);
            }

            const totalTime = Date.now() - startTime;
            const ttfb = firstChunkTime ? firstChunkTime - startTime : totalTime;

            console.log(`[TTS-STREAM] ✅ Stream complete: ${totalBytes} bytes in ${totalTime}ms (TTFB: ${ttfb}ms)`);

        } catch (err: any) {
            console.error(`[TTS-STREAM] ❌ Error:`, err.message);
            throw err;
        }
    }

    /**
     * Create a custom voice on DeepInfra
     */
    async createVoice(name: string, description: string, audioBuffer: Buffer, fileName: string): Promise<any> {
        if (!this.DEEPINFRA_API_KEY) {
            throw new Error('TTS client not initialized. Check DEEPINFRA_TOKEN.');
        }

        const url = 'https://api.deepinfra.com/v1/voices/add';

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);

            const blob = new Blob([audioBuffer as any], { type: 'audio/wav' });
            formData.append('audio', blob, fileName);

            console.log(`[TTS] Creating custom voice: "${name}"`);

            const response = await axios.post(url, formData, {
                headers: {
                    'Authorization': `Bearer ${this.DEEPINFRA_API_KEY}`,
                }
            });

            console.log(`[TTS] Voice created successfully! ID: ${response.data.voice_id}`);
            return response.data;
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                console.error(`[TTS] Create Voice Error: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
                throw new Error(`DeepInfra Error: ${error.response?.status} ${JSON.stringify(error.response?.data)}`);
            }
            throw error;
        }
    }

    /**
     * Synthesize with patient-aware voice selection
     * Automatically selects appropriate voice based on demographics and conditions
     */
    async synthesizeForPatient(
        text: string,
        demographics: PatientDemographics,
        conditions: string[] = [],
        emotionalState: string = 'neutral',
        options: SynthesisOptions = {}
    ): Promise<SynthesisResult> {
        console.log(`[TTS] Patient synthesis: ${demographics.age}yo ${demographics.sex}`);
        console.log(`[TTS] Conditions: ${conditions.join(', ') || 'None'}`);
        console.log(`[TTS] Emotional: ${emotionalState}`);

        // Select appropriate voice
        const primaryCondition = conditions[0] || 'neutral';
        const voice = selectVoiceForPatient(
            demographics,
            { condition: primaryCondition, emotionalState }
        );

        // Get adjusted parameters
        const { exaggeration, temperature, cfg } = getAdjustedParameters(
            voice,
            primaryCondition,
            emotionalState
        );

        console.log(`[TTS] Selected: ${voice.voiceId} (${voice.name})`);

        // Synthesize
        const audioDataUrl = await this.synthesize(
            text,
            voice.voiceId,
            options.exaggeration ?? exaggeration,
            options.temperature ?? temperature,
            options.cfg ?? cfg ?? 0.5,
            options.responseFormat || 'wav'
        );

        return {
            audioDataUrl,
            voiceInfo: {
                voiceId: voice.voiceId,
                voiceName: voice.name,
                exaggeration: options.exaggeration ?? exaggeration,
                temperature: options.temperature ?? temperature
            }
        };
    }

    /**
     * Stream audio to HTTP response
     */
    async streamAudio(
        text: string,
        res: Response,
        voiceId: string = 'Britney',
        exaggeration: number = 0.5,
        temperature: number = 0.8,
        cfg: number = 0.5
    ): Promise<void> {
        try {
            const audioDataUrl = await this.synthesize(text, voiceId, exaggeration, temperature, cfg);
            const base64 = audioDataUrl.split(',')[1];
            const buffer = Buffer.from(base64, 'base64');

            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('X-Voice-Id', voiceId);
            res.send(buffer);
        } catch (e: any) {
            console.error('[TTS] Stream error:', e.message);
            if (!res.headersSent) {
                res.status(500).json({ error: e.message });
            }
        }
    }

    /**
     * Validate a voice ID
     */
    isValidVoice(voiceId: string): boolean {
        return isValidVoiceId(voiceId);
    }

    /**
     * Get voice details
     */
    getVoiceDetails(voiceId: string): DeepInfraVoice | null {
        return getVoiceById(voiceId) || null;
    }

    /**
     * Get all available voices
     */
    getAvailableVoices(): {
        total: number;
        male: DeepInfraVoice[];
        female: DeepInfraVoice[];
    } {
        const allVoices = Object.values(DEEPINFRA_VOICES);
        return {
            total: allVoices.length,
            male: allVoices.filter(v => v.sex === 'male'),
            female: allVoices.filter(v => v.sex === 'female')
        };
    }
}

// Singleton instance
export const ttsService = new TTSService();
