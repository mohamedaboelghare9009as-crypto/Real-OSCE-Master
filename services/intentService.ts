import { EXAMINATION_FINDINGS, INVESTIGATION_LIBRARY } from './simulationData';
import { useSimulationStore } from '../src/stores/useSimulationStore';

export type IntentType = 'EXAM' | 'INVESTIGATION' | 'NAVIGATION' | 'DIAGNOSIS' | 'UNKNOWN';

export interface ParsedIntent {
    type: IntentType;
    action: string;
    targetId?: string;
    originalText: string;
    confidence: number;
    feedback: string;
}

/**
 * Heuristic-based Intent Resolver for Clinical Simulation
 * Maps natural language to Simulation Store actions.
 */
export const intentService = {
    analyze(text: string): ParsedIntent {
        const lower = text.toLowerCase().trim();

        // 1. Navigation Intents
        if (lower.includes('move to') || lower.includes('go to') || lower.includes('start phase')) {
            if (lower.includes('exam')) return { type: 'NAVIGATION', action: 'setPhase', targetId: 'Examination', originalText: text, confidence: 0.9, feedback: "Moving to Examination phase." };
            if (lower.includes('investigat')) return { type: 'NAVIGATION', action: 'setPhase', targetId: 'Investigation', originalText: text, confidence: 0.9, feedback: "Moving to Investigation phase." };
            if (lower.includes('manage') || lower.includes('plan')) return { type: 'NAVIGATION', action: 'setPhase', targetId: 'Management', originalText: text, confidence: 0.9, feedback: "Moving to Management phase." };
        }

        // 2. Examination Intents (e.g., "Listen to heart", "Check pulses", "Examine abdomen")
        const examKeywords = ['listen', 'auscultate', 'check', 'examine', 'feel', 'palpate', 'look', 'inspect'];
        if (examKeywords.some(k => lower.startsWith(k) || lower.includes(` ${k} `))) {
            // Find matching exam in library
            // Simple keyword matching against system/maneuver/finding keywords?
            // Better: Match against 'system' and 'maneuver' names in EXAMINATION_FINDINGS

            // Map "heart" -> Cardiovascular
            // Map "lungs" -> Respiratory
            let systemKeyword = '';
            if (lower.includes('heart') || lower.includes('cardio') || lower.includes('chest')) systemKeyword = 'Cardiovascular';
            else if (lower.includes('lung') || lower.includes('breath') || lower.includes('respiratory')) systemKeyword = 'Respiratory';
            else if (lower.includes('belly') || lower.includes('abdomen') || lower.includes('tummy')) systemKeyword = 'Abdominal';
            else if (lower.includes('extremit') || lower.includes('leg') || lower.includes('arm') || lower.includes('pulse')) systemKeyword = 'Extremities';
            else if (lower.includes('vital') || lower.includes('bp') || lower.includes('pressure')) systemKeyword = 'Constitutional';

            if (systemKeyword) {
                // Determine maneuver if possible, or just pick the first relevant finding for that system mock
                // In a real app we'd have strict mapping. For this mock, we find the first match.
                const exactMatch = EXAMINATION_FINDINGS.find(e => e.system === systemKeyword);
                if (exactMatch) {
                    return {
                        type: 'EXAM',
                        action: 'performExam',
                        targetId: exactMatch.id,
                        originalText: text,
                        confidence: 0.8,
                        feedback: `performing ${exactMatch.system} ${exactMatch.maneuver}`
                    };
                }
            }
        }

        // 3. Investigation Intents (e.g. "Order ECG", "Get a Chest X-Ray")
        const orderKeywords = ['order', 'get', 'request', 'do', 'run'];
        if (orderKeywords.some(k => lower.startsWith(k) || lower.includes(` ${k} `)) || lower.includes('ecg') || lower.includes('x-ray')) {
            // Find matching investigation
            const match = INVESTIGATION_LIBRARY.find(inv =>
                lower.includes(inv.name.toLowerCase()) ||
                (lower.includes('ecg') && inv.name.includes('ECG')) ||
                (lower.includes('x-ray') && inv.name.includes('X-Ray')) ||
                (lower.includes('blood') && inv.name.includes('FBC')) ||
                (lower.includes('trop') && inv.name.includes('Troponin'))
            );

            if (match) {
                return {
                    type: 'INVESTIGATION',
                    action: 'orderInvestigation',
                    targetId: match.id,
                    originalText: text,
                    confidence: 0.85,
                    feedback: `Ordering ${match.name}`
                };
            }
        }

        // 4. Differential Diagnosis (e.g. "Add STEMI to differential")
        if (lower.includes('diagnosis is') || lower.includes('add') && lower.includes('differential')) {
            const diagnosis = text.replace(/add/i, '').replace(/to differential/i, '').replace(/diagnosis is/i, '').trim();
            if (diagnosis.length > 3) {
                return {
                    type: 'DIAGNOSIS',
                    action: 'addDDxItem',
                    targetId: diagnosis, // Pass text as ID here
                    originalText: text,
                    confidence: 0.8,
                    feedback: `Adding ${diagnosis} to differentials`
                };
            }
        }

        return { type: 'UNKNOWN', action: '', originalText: text, confidence: 0, feedback: '' };
    },

    execute(intent: ParsedIntent) {
        // We need to access the store imperatively. 
        // Ideally we pass the store instance or use the hook in component.
        // But intentService is a pure logic helper? 
        // We will return the intent and let the Component execute it using the hook.
        // Or we can import the store directly if it wasn't a hook (Zustand supports vanilla usage).

        const store = useSimulationStore.getState();

        switch (intent.type) {
            case 'EXAM':
                if (intent.targetId) {
                    const exam = EXAMINATION_FINDINGS.find(e => e.id === intent.targetId);
                    if (exam) {
                        store.performExam(exam);
                        // Auto-switch phase if needed? No, let user confirm.
                        if (store.currentPhase !== 'Examination' && store.unlockedPhases.includes('Examination')) {
                            store.setPhase('Examination');
                        }
                    }
                }
                break;
            case 'INVESTIGATION':
                if (intent.targetId) {
                    const test = INVESTIGATION_LIBRARY.find(t => t.id === intent.targetId);
                    if (test) {
                        store.orderInvestigation(test);
                        if (store.currentPhase !== 'Investigation' && store.unlockedPhases.includes('Investigation')) {
                            store.setPhase('Investigation');
                        }
                    }
                }
                break;
            case 'NAVIGATION':
                if (intent.targetId) {
                    store.setPhase(intent.targetId as any);
                }
                break;
            case 'DIAGNOSIS':
                if (intent.targetId) {
                    store.addDDxItem(intent.targetId);
                }
                break;
        }
    }
};
