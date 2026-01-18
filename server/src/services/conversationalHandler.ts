// server/src/services/conversationalHandler.ts

export type ConversationalHandlerResult = {
  reply: string;
  meta?: Record<string, unknown>;
};

/**
 * TODO: Replace with your real conversation handling logic.
 * This stub exists to unblock TypeScript compilation on Render.
 */
export async function conversationalHandler(_input: {
  text: string;
  userId?: string;
  sessionId?: string;
}): Promise<ConversationalHandlerResult> {
  return { reply: "OK" };
}
