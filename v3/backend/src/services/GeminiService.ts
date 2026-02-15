import { GoogleGenerativeAI, GenerativeModel, ChatSession } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

export class GeminiService {
    private genAI: GoogleGenerativeAI;
    private model: GenerativeModel;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY || "";
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    async createChatSession(systemInstruction: string, history: any[] = []): Promise<ChatSession> {
        return this.model.startChat({
            history: history,
            generationConfig: {
                temperature: 0.2,
                topP: 0.95,
                maxOutputTokens: 1000,
            },
            systemInstruction: systemInstruction
        });
    }

    async generateContent(prompt: string, systemInstruction?: string): Promise<string> {
        const result = await this.model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            systemInstruction: systemInstruction ? { role: 'system', parts: [{ text: systemInstruction }] } : undefined
        });
        return result.response.text();
    }
}

export const geminiService = new GeminiService();
