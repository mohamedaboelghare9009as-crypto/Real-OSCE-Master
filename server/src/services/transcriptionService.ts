import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

export class TranscriptionService {
    private genAI: GoogleGenAI;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
        this.genAI = new GoogleGenAI({ apiKey: apiKey || 'dummy' });
    }

    async transcribe(file: Express.Multer.File): Promise<string> {
        try {
            // Convert buffer to base64
            const audioBase64 = file.buffer.toString('base64');
            const mimeType = file.mimetype; // e.g. 'audio/webm' or 'audio/wav'

            const response = await this.genAI.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: [
                    {
                        role: 'user',
                        parts: [
                            { text: "Transcribe the following audio exactly. Return ONLY the text, no preamble." },
                            {
                                inlineData: {
                                    mimeType: mimeType,
                                    data: audioBase64
                                }
                            }
                        ]
                    }
                ]
            });

            const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
            return text ? text.trim() : "";
        } catch (error) {
            console.error("Transcription Failed:", error);
            throw new Error("Failed to transcribe audio");
        }
    }
}

export const transcriptionService = new TranscriptionService();
