
import { OsceCase, CaseStage, MarkingItem } from '../../schemas/caseSchema';
import { SessionState } from '../../schemas/sessionSchema';
import { ScoringLogger } from './logger';

export interface ScoringResult {
    pointsAwarded: number;
    pointsTotal: number;
    criticalFlags: string[];
    updatedStage?: CaseStage;
    isStageFailed?: boolean;
    feedback?: string;
}

export class ScoringEngine {

    /**
     * Evaluates a user action against the case marking scheme.
     */
    static async evaluateAction(
        caseContent: OsceCase,
        session: SessionState,
        action: string,
        stage: CaseStage
    ): Promise<ScoringResult> {

        let pointsAwarded = 0;
        const criticalFlags: string[] = [];
        let feedback = "Action recorded.";

        // 1. Validate Stage (Soft check, as MCP should catch this)
        if (stage !== session.currentStage) {
            // In strict mode, we might penalize. For now, just log warning.
            // console.warn(`Action received for stage ${stage} but current is ${session.currentStage}`);
        }

        // 2. Find matching marking item
        // Heuristic: Check if action string contains key phrases from marking items for the current stage
        // In a real AI system, we'd use semantic similarity.
        const relevantItems = caseContent.markingScheme.checklist.filter(
            item => item.domain === stage
        );

        let matchedItem: MarkingItem | undefined;

        // Simple fuzzy match: Does the marking item text appear in the action, or vice versa?
        // Or better: Does the action roughly match the item?
        // For MVP: We assume the 'action' passed here is already normalized by MCP or is a selection.
        // If it's free text, we do a naive inclusion check.

        const normalizedAction = action.toLowerCase();
        console.log(`[ScoringEngine] Evaluating: "${normalizedAction}" in stage: ${stage}`);

        matchedItem = relevantItems.find(item => {
            const itemText = item.item.toLowerCase();
            const isMatch = normalizedAction.includes(itemText) || itemText.includes(normalizedAction);
            if (isMatch) console.log(`[ScoringEngine] MATCH FOUND: "${item.item}"`);
            return isMatch;
        });

        if (!matchedItem) {
            console.log(`[ScoringEngine] No match for "${normalizedAction}". Relevant items for ${stage}:`, relevantItems.map(i => i.item));
        }

        // 3. Check for duplicates (Don't double award)
        // Check if this specific item has already been awarded in session.actionsTaken
        // This requires us to know WHICH item was matched previously.
        // For MVP, we'll check if an action with the exact same 'details' (item text) exists.

        const alreadyAwarded = matchedItem && session.actionsTaken.some(
            taken => taken.details?.itemText === matchedItem.item
        );

        let isStageFailed = false;

        if (matchedItem && !alreadyAwarded) {
            pointsAwarded = matchedItem.weight;
            if (matchedItem.critical) {
                if (matchedItem.weight < 0) {
                    criticalFlags.push(matchedItem.item);
                    isStageFailed = true;
                }
            }
            feedback = `Matched: ${matchedItem.item}`;
        } else if (alreadyAwarded) {
            feedback = "Already performed.";
            pointsAwarded = 0;
        } else {
            feedback = "Action not in marking scheme.";
        }

        const newTotal = (session.scoreTotal || 0) + pointsAwarded;

        // 5. Log
        await ScoringLogger.logAction({
            userId: session.userId,
            sessionId: "session-id-placeholder", // We might need this in arguments if not in session struct?
            action: action,
            stage: stage,
            pointsAwarded: pointsAwarded,
            criticalFlags: criticalFlags,
            timestamp: new Date(),
            details: matchedItem ? { itemText: matchedItem.item } : undefined
        });

        return {
            pointsAwarded,
            pointsTotal: newTotal,
            criticalFlags,
            isStageFailed,
            feedback
        };
    }

    /**
     * Checks if a stage is complete or failed.
     */
    static checkStageCompletion(session: SessionState, caseContent: OsceCase): boolean {
        // Logic to determine if stage is done.
        // E.g., Time limit, or user explicit "Next"
        // This might be handled by the MCP 'next_stage' tool.
        return false;
    }
}
