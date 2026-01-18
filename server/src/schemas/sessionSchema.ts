import { CaseStage } from './caseSchema';

export interface SessionState {
    userId: string;
    caseId: string;
    currentStage: CaseStage;
    completedStages: CaseStage[];
    scoreTotal: number;
    criticalFlags: string[];
    failedStage: boolean;
    actionsTaken: {
        action: string;
        stage: CaseStage;
        pointsAwarded: number;
        timestamp: Date;
        details?: any;
    }[];
    startTime: Date;
    lastInteraction: Date;
    isCompleted: boolean;
    revealedFacts: string[]; // Set of intent codes already revealed
    history: {
        role: 'user' | 'model';
        content: string;
        timestamp: Date;
    }[];
}
