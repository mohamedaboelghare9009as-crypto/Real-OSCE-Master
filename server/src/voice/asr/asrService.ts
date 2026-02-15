
export interface ASRService {
    transcribe(audioBase64: string): Promise<string>;
}

export class MockASRService implements ASRService {
    async transcribe(audioBase64: string): Promise<string> {
        // Mock: In a real app, send to Google Speech-to-Text
        // Here, we assume the client *might* send text directly for MVP testing
        // or we return a placeholder if only audio is sent.
        console.log(`[ASR] Processing ${audioBase64.length} bytes of audio...`);
        return "I have chest pain."; // Fallback mock
    }
}

export const asrService = new MockASRService();
