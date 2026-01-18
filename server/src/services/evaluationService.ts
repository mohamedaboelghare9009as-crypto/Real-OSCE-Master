export class EvaluationService {
    async assessDifferential(caseId: string, submittedDDx: string[], stage: string) {
        return {
            feedback: "Evaluation disabled. (Custom Engine Placeholder)",
            score: 0,
            missed: [],
            correct: []
        };
    }

    async evaluateSession(sessionId: string, transcript: any[]) {
        return {
            score: 0,
            feedback: "Evaluation disabled. (Custom Engine Placeholder)",
            strengths: [],
            improvements: []
        };
    }
}

export const evaluationService = new EvaluationService();
