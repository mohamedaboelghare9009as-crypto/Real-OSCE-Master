import { GoogleGenAI } from '@google/genai';

export class EmbeddingService {
    private genAI: GoogleGenAI;
    private model = "text-embedding-004";

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
        if (!apiKey) {
            console.warn("WARN: GEMINI_API_KEY/API_KEY not found in environment variables");
        }
        this.genAI = new GoogleGenAI({ apiKey: apiKey || 'dummy' });
    }

    async getEmbeddings(texts: string[]): Promise<number[][]> {
        try {
            // Google GenAI SDK allows batch embedding usually, but let's check method signature.
            // Using batchEmbedContents if available or looping.
            // The current SDK naming might vary, assuming 'models.embedContent' for single.
            // For batch, we'll map.

            const promises = texts.map(async (text) => {
                const result = await this.genAI.models.embedContent({
                    model: this.model,
                    contents: [{ parts: [{ text }] }]
                });
                return result.embeddings?.[0]?.values || [];
            });

            return await Promise.all(promises);
        } catch (error) {
            console.error("Embedding generation failed:", error);
            throw error;
        }
    }
}

export const embeddingService = new EmbeddingService();
