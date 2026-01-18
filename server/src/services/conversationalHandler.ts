// server/src/services/conversationalHandler.ts

export type ConversationalHandlerResult = {
  reply: string;
  meta?: Record<string, unknown>;
};

/**
 * patientService.ts is calling conversationalHandler.generateResponse(...)
 * so we export an object with a generateResponse() method.
 */
export const conversationalHandler = {
  async generateResponse(_input: {
    text: string;
    userId?: string;
    sessionId?: string;
  }): Promise<ConversationalHandlerResult> {
    return { reply: "OK" };
  }
};
