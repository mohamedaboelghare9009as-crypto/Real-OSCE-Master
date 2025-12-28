import { GoogleGenAI, Chat } from "@google/genai";

let chatSession: Chat | null = null;
let genAI: GoogleGenAI | null = null;

export const initializeSession = async (systemInstruction: string) => {
  // API key must be obtained exclusively from process.env.API_KEY
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found in process.env.API_KEY");
    throw new Error("API Key configuration missing");
  }

  genAI = new GoogleGenAI({ apiKey });

  chatSession = genAI.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7,
      // Removed maxOutputTokens to allow natural response length, or set specific thinkingBudget if needed.
      // For chat, we let the model decide appropriate length based on instruction.
    }
  });

  return chatSession;
};

export const sendMessageToPatient = async (message: string): Promise<string> => {
  if (!chatSession) throw new Error("Session not initialized");

  try {
    const result = await chatSession.sendMessage({ message });
    return result.text || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};