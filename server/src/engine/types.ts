import { IntentCode } from '../types/intents';

export interface IntentResult {
    intent: IntentCode;
    confidence: number;
    originalQuery: string;
    source: 'heuristic' | 'llm' | 'fallback';
}

export interface GateResult {
    allowed: boolean;
    reason?: string;
}

export interface FactResult {
    fact: string;
    sourcePath?: string;
    found: boolean;
}

export interface SimulationResponse {
    text: string;
    finalIntent: IntentCode;
    debug?: any;
    meta?: any;
}

export interface EngineContext {
    sessionId: string;
    caseId: string;
    stage: string;
    userId: string;
    revealedFacts: string[];
    history: any[];
}
