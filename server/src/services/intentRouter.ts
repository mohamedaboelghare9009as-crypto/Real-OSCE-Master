// server/src/services/intentRouter.ts

export enum IntentCategory {
  CONVERSATIONAL = "CONVERSATIONAL",
  UNCLEAR = "UNCLEAR",
  CLINICAL = "CLINICAL"
}

export type IntentRouteResult = {
  category: IntentCategory;
  confidence?: number;
  meta?: Record<string, unknown>;
};

export const intentRouter = {
  async route(_message: string): Promise<IntentRouteResult> {
    return { category: IntentCategory.CLINICAL, confidence: 0.5 };
  }
};
