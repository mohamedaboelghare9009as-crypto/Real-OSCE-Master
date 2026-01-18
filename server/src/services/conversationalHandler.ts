// server/src/services/conversationalHandler.ts

export type ConversationalHandlerResult = {
  reply: string;
  meta?: Record<string, unknown>;
};

/**
 * patientService.ts sometimes passes a case object (e.g., OsceCaseV2),
 * sometimes a string, sometimes an object with text.
 * We'll accept ANY input and derive text safely.
 */
export const conversationalHandler = {
  async generateResponse(
    input: unknown,
    _maybeUserId?: string,
    _maybeSessionId?: string
  ): Promise<ConversationalHandlerResult> {
    // If they passed { text: "..." }
    const asObj = input as any;
    const text =
      typeof input === "string"
        ? input
        : typeof asObj?.text === "string"
          ? asObj.text
          : "";

    // If they passed a case object, just acknowledge (stub)
    if (!text && input && typeof input === "object") {
      return { reply: "OK" };
    }

    return { reply: text ? "OK" : "Please provide a message." };
  }
};
