
export interface ActionLog {
    userId: string;
    sessionId: string;
    action: string;
    stage: string;
    pointsAwarded: number;
    criticalFlags: string[];
    timestamp: Date;
    details?: any;
}

export class ScoringLogger {
    static async logAction(log: ActionLog) {
        // In a real app, this would write to a DB or Log Service
        console.log(`[SCORING] [${log.timestamp.toISOString()}] User: ${log.userId}, Stage: ${log.stage}, Action: "${log.action}", Points: ${log.pointsAwarded}, Critical: ${log.criticalFlags.join(', ') || 'None'}`);
        // TODO: Persist to generic "audit_logs" collection in Mongo
    }

    static async logError(userId: string, sessionId: string, error: string) {
        console.error(`[SCORING_ERROR] User: ${userId}, Session: ${sessionId}, Error: ${error}`);
    }
}
