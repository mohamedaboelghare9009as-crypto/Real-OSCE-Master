// server/src/services/conversationalHandler.ts

export type ConversationalHandlerResult = {
  reply: string;
  meta?: Record<string, unknown>;
};

/**
 * IMPORTANT:
 * patientService.ts is passing an OsceCaseV2 object in some calls.
 * So we MUST accept unknown (not string) to satisfy TS.
 */
export const conversationalHandler = {
  async generateResponse(
    _input: unknown,
    _maybeUserId?: string,
    _maybeSessionId?: string
  ): Promise<ConversationalHandlerResult> {
    return { reply: "OK" };
  }
};
