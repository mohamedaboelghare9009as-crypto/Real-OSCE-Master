import { PatientEmotion } from '../../../types';

/**
 * Peplau's Theory of Interpersonal Relations
 * Maps simulation stages to therapeutic relationship phases
 * 
 * Reference: Hildegard Peplau (1952) - Interpersonal Relations in Nursing
 */

export enum PeplauPhase {
    ORIENTATION = 'ORIENTATION',           // Getting to know each other
    IDENTIFICATION = 'IDENTIFICATION',     // Patient begins to feel belonging
    EXPLOITATION = 'EXPLOITATION',         // Patient makes full use of services
    RESOLUTION = 'RESOLUTION'              // Patient's needs are met
}

export enum ClinicalStage {
    HISTORY = 'History',
    EXAMINATION = 'Examination', 
    INVESTIGATIONS = 'Investigations',
    MANAGEMENT = 'Management'
}

interface PeplauState {
    phase: PeplauPhase;
    clinicalStage: ClinicalStage;
    nurseRole: string;
    patientBehavior: string;
    goals: string[];
    expectedEmotion: PatientEmotion;
}

/**
 * Maps clinical stages to Peplau's interpersonal phases
 * This creates a psychological progression alongside the clinical workflow
 */
export const PeplauStageMapping: Record<ClinicalStage, PeplauState> = {
    [ClinicalStage.HISTORY]: {
        phase: PeplauPhase.ORIENTATION,
        clinicalStage: ClinicalStage.HISTORY,
        nurseRole: 'Stranger → Resource Person',
        patientBehavior: 'Seeking help, expressing concern, testing trust',
        goals: [
            'Establish therapeutic relationship',
            'Create safe environment for disclosure',
            'Assess patient\'s perception of problem',
            'Build rapport and trust'
        ],
        expectedEmotion: PatientEmotion.ANXIOUS
    },
    
    [ClinicalStage.EXAMINATION]: {
        phase: PeplauPhase.IDENTIFICATION,
        clinicalStage: ClinicalStage.EXAMINATION,
        nurseRole: 'Counselor → Surrogate',
        patientBehavior: 'Beginning to feel understood, participating actively',
        goals: [
            'Deepen therapeutic relationship',
            'Patient feels accepted and understood',
            'Collaborative assessment',
            'Validate patient\'s concerns'
        ],
        expectedEmotion: PatientEmotion.NEUTRAL
    },
    
    [ClinicalStage.INVESTIGATIONS]: {
        phase: PeplauPhase.EXPLOITATION,
        clinicalStage: ClinicalStage.INVESTIGATIONS,
        nurseRole: 'Teacher → Leader',
        patientBehavior: 'Making full use of resources, learning about condition',
        goals: [
            'Patient actively participates in care',
            'Education about condition',
            'Shared decision-making',
            'Maximize use of clinical resources'
        ],
        expectedEmotion: PatientEmotion.NEUTRAL
    },
    
    [ClinicalStage.MANAGEMENT]: {
        phase: PeplauPhase.RESOLUTION,
        clinicalStage: ClinicalStage.MANAGEMENT,
        nurseRole: 'Consultant → Terminator',
        patientBehavior: 'Needs met, preparing for independence',
        goals: [
            'Finalize treatment plan',
            'Patient feels empowered',
            'Prepare for discharge/follow-up',
            'Review learning and progress'
        ],
        expectedEmotion: PatientEmotion.NEUTRAL
    }
};

/**
 * PeplauStageManager
 * Manages the psychological progression through the therapeutic relationship
 */
export class PeplauStageManager {
    
    /**
     * Get the Peplau state for a clinical stage
     */
    static getState(clinicalStage: ClinicalStage): PeplauState {
        return PeplauStageMapping[clinicalStage];
    }
    
    /**
     * Get nurse role guidance for the current phase
     */
    static getNurseRole(clinicalStage: ClinicalStage): string {
        return this.getState(clinicalStage).nurseRole;
    }
    
    /**
     * Get expected patient behavior for the current phase
     */
    static getPatientBehavior(clinicalStage: ClinicalStage): string {
        return this.getState(clinicalStage).patientBehavior;
    }
    
    /**
     * Get therapeutic goals for the current phase
     */
    static getGoals(clinicalStage: ClinicalStage): string[] {
        return this.getState(clinicalStage).goals;
    }
    
    /**
     * Get expected patient emotion for the current phase
     */
    static getExpectedEmotion(clinicalStage: ClinicalStage): PatientEmotion {
        return this.getState(clinicalStage).expectedEmotion;
    }
    
    /**
     * Check if student is following Peplau's therapeutic principles
     */
    static validateTherapeuticApproach(
        clinicalStage: ClinicalStage,
        studentAction: string,
        patientEmotion: PatientEmotion
    ): {
        isAligned: boolean;
        feedback: string;
        suggestions: string[];
    } {
        const state = this.getState(clinicalStage);
        const suggestions: string[] = [];
        
        // Check phase-specific therapeutic requirements
        switch (state.phase) {
            case PeplauPhase.ORIENTATION:
                if (!studentAction.toLowerCase().includes('hello') && 
                    !studentAction.toLowerCase().includes('name') &&
                    !studentAction.toLowerCase().includes('concern')) {
                    suggestions.push('In the Orientation phase, begin with proper introductions');
                    suggestions.push('Establish rapport before diving into clinical questions');
                }
                if (patientEmotion === PatientEmotion.ANXIOUS) {
                    suggestions.push('Acknowledge patient anxiety to build trust');
                }
                break;
                
            case PeplauPhase.IDENTIFICATION:
                if (!studentAction.toLowerCase().includes('understand') &&
                    !studentAction.toLowerCase().includes('feel')) {
                    suggestions.push('In the Identification phase, validate patient\'s feelings');
                    suggestions.push('Use empathetic statements to deepen relationship');
                }
                break;
                
            case PeplauPhase.EXPLOITATION:
                if (!studentAction.toLowerCase().includes('explain') &&
                    !studentAction.toLowerCase().includes('what this means')) {
                    suggestions.push('In the Exploitation phase, educate the patient');
                    suggestions.push('Encourage questions and active participation');
                }
                break;
                
            case PeplauPhase.RESOLUTION:
                if (!studentAction.toLowerCase().includes('plan') &&
                    !studentAction.toLowerCase().includes('next')) {
                    suggestions.push('In the Resolution phase, summarize and plan ahead');
                    suggestions.push('Empower patient for self-management');
                }
                break;
        }
        
        return {
            isAligned: suggestions.length === 0,
            feedback: suggestions.length > 0 
                ? `Consider Peplau\'s ${state.phase} phase: ${state.nurseRole}`
                : 'Therapeutic approach aligns with Peplau\'s theory',
            suggestions
        };
    }
    
    /**
     * Generate system prompt context based on Peplau phase
     */
    static generateSystemContext(clinicalStage: ClinicalStage): string {
        const state = this.getState(clinicalStage);
        
        return `
THERAPEUTIC RELATIONSHIP CONTEXT (Peplau's Theory):
Current Phase: ${state.phase}
Nurse Role: ${state.nurseRole}
Patient Behavior: ${state.patientBehavior}

Therapeutic Goals for this Phase:
${state.goals.map((goal, i) => `${i + 1}. ${goal}`).join('\n')}

Expected Patient Emotion: ${state.expectedEmotion}

Guidance: Respond as a patient who is in the ${state.phase} phase of building a therapeutic relationship with the nurse.
`;
    }
}

export default PeplauStageManager;
