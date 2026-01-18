// server/src/services/intentClassifier.ts

// Keep IntentCode flexible
export type IntentCode = string;

export type IntentClassification = {
  // patientService.ts expects `.intent`
  intent: IntentCode;
  confidence?: number;
  meta?: Record<string, unknown>;
};

/**
 * patientService.ts calls intentClassifier.classify(...) and then reads `.intent`.
 * Allow optional 2nd arg (context/case).
 */
export const intentClassifier = {
  async classify(_text: string, _context?: unknown): Promise<IntentClassification> {
    return { intent: "unknown", confidence: 0.0 };
  }
};
