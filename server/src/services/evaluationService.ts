import { SessionState } from '../schemas/sessionSchema';
import { OsceCase, OsceCaseV2 } from '../schemas/caseSchema';

type AnyCase = OsceCase | OsceCaseV2;

export class EvaluationService {
    async assessDifferential(caseContent: AnyCase, submittedDDx: string[], stage: string) {
        const v2Case = caseContent as OsceCaseV2;
        const ddxMap = (v2Case as any).ddx_map || {};
        const correctDDx: string[] = ddxMap.correct || [];
        const acceptableDDx: string[] = ddxMap.acceptable || [];
        const missedCritical: string[] = ddxMap.missed_critical || [];

        const correct = submittedDDx.filter((ddx: string) =>
            correctDDx.some((c: string) => c.toLowerCase().includes(ddx.toLowerCase())) ||
            acceptableDDx.some((a: string) => a.toLowerCase().includes(ddx.toLowerCase()))
        );

        const missed = correctDDx.filter((ddx: string) =>
            !submittedDDx.some((s: string) => s.toLowerCase().includes(ddx.toLowerCase()))
        );

        const hasCriticalError = missedCritical.some((missedCriticalDDx: string) =>
            !submittedDDx.some((s: string) => s.toLowerCase().includes(missedCriticalDDx.toLowerCase()))
        );

        const score = submittedDDx.length > 0 && correctDDx.length > 0
            ? Math.round((correct.length / correctDDx.length) * 100)
            : 0;

        return {
            feedback: hasCriticalError
                ? "Critical differential diagnosis missed."
                : `Identified ${correct.length} of ${correctDDx.length} expected diagnoses.`,
            score,
            missed,
            correct,
            hasCriticalError
        };
    }

    async evaluateSession(session: SessionState, caseContent: AnyCase) {
        const scoreTotal = session.scoreTotal || 0;
        
        // Support both OsceCase (markingScheme) and OsceCaseV2 (marking_scheme)
        let totalPossible = 0;
        const v1Case = caseContent as OsceCase;
        const v2Case = caseContent as OsceCaseV2;
        
        if (v1Case.markingScheme && v1Case.markingScheme.checklist) {
            totalPossible = v1Case.markingScheme.checklist.reduce((sum, item) => sum + Math.abs(item.weight), 0);
        } else if (v2Case.marking_scheme && v2Case.marking_scheme.checklist) {
            totalPossible = v2Case.marking_scheme.checklist.reduce((sum, item) => sum + Math.abs(item.weight || item.points || 0), 0);
        }
        
        const scorePercent = totalPossible > 0 ? Math.round((scoreTotal / totalPossible) * 100) : 0;

        const criticalFlags = session.criticalFlags || [];
        const actionsTaken = session.actionsTaken || [];

        const strengths: string[] = [];
        const improvements: string[] = [];

        if (criticalFlags.length > 0) {
            improvements.push(`Critical errors flagged: ${criticalFlags.join(', ')}`);
        }

        if (session.failedStage) {
            improvements.push("Failed at least one stage due to critical error.");
        }

        const completedActions = actionsTaken.filter(a => a.pointsAwarded > 0).length;
        const totalActions = actionsTaken.length;
        strengths.push(`Completed ${completedActions} of ${totalActions} marked actions.`);

        if (scorePercent >= 70) {
            strengths.push("Passing score achieved.");
        } else if (scorePercent >= 50) {
            improvements.push("Approaching passing threshold - review missed items.");
        } else {
            improvements.push("Below passing threshold - significant gaps in assessment.");
        }

        const passed = scorePercent >= 50 && criticalFlags.length === 0 && !session.failedStage;

        return {
            score: scorePercent,
            finalScore: scoreTotal,
            passed,
            feedback: passed
                ? "Congratulations! You passed this OSCE station."
                : "Please review feedback and try again.",
            strengths,
            improvements,
            criticalFlags,
            completedStages: session.completedStages,
            totalActions,
            passedActions: completedActions
        };
    }
}

export const evaluationService = new EvaluationService();
