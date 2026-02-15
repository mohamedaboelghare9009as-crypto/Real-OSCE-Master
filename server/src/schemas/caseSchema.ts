export type CaseDifficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Medium';
export type CaseSpecialty = 'Cardiology' | 'Respiratory' | 'Gastroenterology' | 'Neurology' | 'Psychiatry' | 'Pediatrics' | 'Surgery' | 'Other';

export interface CaseMetadata {
    id?: string; // Internal: Can be ObjectId string
    title: string;
    specialty: CaseSpecialty;
    difficulty: CaseDifficulty;
    description: string; // Brief summary for list view
    tags: string[];
}

export interface HistorySection {
    chiefComplaint: string;
    description: string;
    hpi: string;
    pmh: string;
    medications: string;
    allergies: string;
    socialHistory: string;
    familyHistory: string;
    reviewOfSystems: string;
}

export interface ExaminationFinding {
    system: string;
    finding: string;
    isAbnormal: boolean;
}

export interface ExaminationSection {
    generalAppearance: string;
    vitals: {
        hr: number;
        bp: string;
        rr: number;
        spo2: number;
        temp: number;
    };
    findings: ExaminationFinding[];
}

export interface InvestigationResult {
    name: string;
    result: string;
    normalRange?: string;
    abnormal: boolean;
}

export interface InvestigationsSection {
    bedside: InvestigationResult[];
    confirmatory: InvestigationResult[];
}

export interface ManagementStep {
    action: string;
    category: 'Immediate' | 'Short-term' | 'Long-term';
    explanation: string;
}

export interface ManagementSection {
    steps: ManagementStep[];
    diagnosis: string;
}

export interface MarkingItem {
    domain: 'History' | 'Examination' | 'Investigations' | 'Management' | 'Communication';
    item: string;
    weight: number;
    critical?: boolean;
    penalty?: number;
}

export interface MarkingScheme {
    checklist: MarkingItem[];
    globalRating?: number;
}

// The Full Canonical Case (V1)
export interface OsceCase {
    metadata: CaseMetadata;
    history: HistorySection;
    examination: ExaminationSection;
    investigations: InvestigationsSection;
    management: ManagementSection;
    markingScheme: MarkingScheme;
}

// Stage Definition for API
export type CaseStage = 'History' | 'Examination' | 'Investigations' | 'Management';

// --- V2 Schema Definitions (User Provided) ---

export interface OsceCaseV2 {
    case_metadata: {
        case_id: string;
        title: string;
        specialty: string;
        difficulty: string;
        expected_duration_minutes: number;
        innovation_element: string;
        learning_objectives: string[];
    };
    scenario: {
        station_type: string;
        candidate_instructions: string;
        osce_stages: string[];
    };
    truth: {
        demographics: {
            age: number;
            sex: string;
            occupation: string;
        };
        final_diagnosis: string;
        emotional_state?: string;
        voice_persona?: {
            voice_id?: string;
            flow?: number; // Speed: 0.25 to 4.0
            frequency?: number; // Pitch: -20 to 20
            tone?: 'Narrative' | 'Concerned' | 'Anxious' | 'Normal';
        };
        history: {
            chief_complaint: string;
            onset: string;
            duration: string;
            associated_symptoms: string[];
            risk_factors: string[];
            character?: string;
            radiation?: string;
            exacerbating_factors?: string;
            relieving_factors?: string;
            severity?: string;
            description?: string;
            [key: string]: any; // Allow flexibility
        };
        // Top-level past history fields
        past_medical_history?: string;
        medications?: string;
        allergies?: string;
        social_history?: string | object;
        family_history?: string;
        // Exam and investigations
        mental_state_exam?: any;
        physical_exam?: {
            general?: string;
            cardiovascular?: string;
            respiratory?: string;
            abdomen?: string;
            neurological?: string;
            [key: string]: any;
        };
        investigations: {
            bedside: any;
            confirmatory: any;
        };
    };
    ddx_map: any;
    marking_scheme: any;
}
