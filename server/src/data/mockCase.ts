import { OsceCase, OsceCaseV2 } from '../schemas/caseSchema';

export const MOCK_CASE_ID = 'mock-case-001';

// ============================================
// V2 MOCK CASE - Used by Deterministic Pipeline
// ============================================
export const MOCK_CASE_V2: OsceCaseV2 = {
    case_metadata: {
        case_id: MOCK_CASE_ID,
        title: 'Acute Chest Pain - Mock Case',
        specialty: 'Cardiology',
        difficulty: 'Intermediate',
        expected_duration_minutes: 10,
        innovation_element: 'Classic ACS Presentation',
        learning_objectives: ['Recognize STEMI', 'Perform cardiac examination', 'Initiate ACS protocol']
    },
    scenario: {
        station_type: 'History + Examination + Management',
        candidate_instructions: 'A 55-year-old male presents with central chest pain. Take a focused history, perform relevant examination, and outline your management.',
        osce_stages: ['history', 'examination', 'investigations', 'management']
    },
    truth: {
        demographics: {
            age: 55,
            sex: 'Male',
            occupation: 'Accountant'
        },
        final_diagnosis: 'Acute Inferior Myocardial Infarction (STEMI)',
        emotional_state: "Anxious, in severe pain, scared of dying",
        voice_persona: {
            voice_id: "en-US-Studio-Q",
            flow: 1.1, // Slightly faster due to anxiety
            frequency: 0.0,
            tone: "Concerned"
        },
        history: {
            chief_complaint: 'I have a crushing pain in my chest.',
            onset: 'It started suddenly about 2 hours ago while I was gardening.',
            duration: 'About 2 hours now.',
            character: "It's a crushing, heavy pressure in the center of my chest.",
            radiation: 'It goes down my left arm and up to my jaw.',
            associated_symptoms: ['nausea', 'sweating', 'shortness of breath'],
            exacerbating_factors: "Nothing makes it worse, it just stays the same.",
            relieving_factors: "Nothing helps. I tried resting but it won't go away.",
            severity: "It's an 8 out of 10. The worst pain I've ever had.",
            risk_factors: ['hypertension', 'hyperlipidemia', 'smoking 30 pack-years', 'family history of MI']
        },
        past_medical_history: 'I have high blood pressure and high cholesterol. Diagnosed about 5 years ago.',
        medications: 'I take Amlodipine 5mg and Atorvastatin 20mg every day.',
        allergies: "I'm allergic to Penicillin. I get a rash.",
        social_history: 'I smoke about a pack a day for 30 years. I drink occasionally on weekends. I work as an accountant.',
        family_history: 'My father died of a heart attack when he was 60.',
        physical_exam: {
            general: 'Anxious, diaphoretic, clutching chest',
            cardiovascular: 'Tachycardic at 110bpm, regular rhythm, S4 gallop, no murmurs',
            respiratory: 'Clear to auscultation bilaterally',
            abdomen: 'Soft, non-tender, non-distended',
            neurological: 'Grossly intact'
        },
        mental_state_exam: {
            appearance: 'Appropriate dress and grooming.',
            behaviour: 'Cooperative but distressed due to pain.',
            mood: 'Anxious.',
            speech: 'Normal rate and tone.',
            thought_process: 'Logical and goal-directed.',
            thought_content: 'Preoccupied with fear of death.',
            perception: 'No hallucinations.',
            cognition: 'Oriented to time, place, and person. Able to count back from 10.',
            insight: 'Good insight into condition.'
        },
        investigations: {
            bedside: {
                ECG: 'ST elevation in leads II, III, aVF. This is an Inferior MI pattern.',
                Troponin: 'Elevated at 2.5 ng/mL (normal < 0.04)'
            },
            confirmatory: {
                CXR: 'Normal cardiac silhouette, no pulmonary edema',
                Echo: 'Inferior wall hypokinesis'
            }
        }
    },
    ddx_map: {
        'STEMI': { priority: 'high', key_clues: ['ST elevation', 'crushing chest pain', 'radiation to arm'] },
        'NSTEMI': { priority: 'medium', key_clues: ['chest pain', 'elevated troponin', 'no ST elevation'] },
        'Aortic Dissection': { priority: 'low', key_clues: ['tearing pain', 'BP differential between arms'] },
        'Pulmonary Embolism': { priority: 'low', key_clues: ['pleuritic pain', 'dyspnea', 'tachycardia'] }
    },
    marking_scheme: {
        history_taking: [
            { action: 'Asked about onset of pain', points: 1 },
            { action: 'Asked about radiation', points: 1 },
            { action: 'Identified cardiac risk factors', points: 1 }
        ],
        examination: [
            { action: 'Checked vitals', points: 1 }
        ],
        investigations: [
            { action: 'Ordered ECG', points: 2, critical: true }
        ],
        management: [
            { action: 'Administered Aspirin', points: 2, critical: true }
        ]
    }
};

// ============================================
// V1 MOCK CASE - Legacy Format (Deprecated)
// ============================================
export const MOCK_CASE: OsceCase = {
    metadata: {
        id: MOCK_CASE_ID,
        title: "Acute Chest Pain - Mock Case",
        specialty: "Cardiology",
        difficulty: "Intermediate",
        description: "A 55-year-old male presenting with central chest pain.",
        tags: ["Cardiology", "Chest Pain", "Emergency"]
    },
    history: {
        chiefComplaint: "Chest pain",
        description: "Patient is a 55-year-old male presenting with acute central chest pain starting 2 hours ago.",
        hpi: "Patient reports sudden onset of central crushing chest pain while gardening. Pain radiates to the left arm and jaw. Rated 8/10 severity. Associated with nausea and diaphoresis. No relief with rest.",
        pmh: "Hypertension (diagnosed 5 years ago), Hyperlipidemia.",
        medications: "Amlodipine 5mg daily, Atorvastatin 20mg daily.",
        allergies: "Penicillin (rash).",
        socialHistory: "Smokes 1 pack per day for 30 years. Occasional alcohol. Works as an accountant.",
        familyHistory: "Father died of MI at age 60.",
        reviewOfSystems: "Cardiovascular: Chest pain, palpitations. Respiratory: Dyspnea on exertion. GI: Numbness/tingling in left arm. CNS: Dizziness."
    },
    examination: {
        generalAppearance: "Anxious, diaphoretic, clutching chest.",
        vitals: {
            hr: 110,
            bp: "150/90",
            rr: 22,
            spo2: 96,
            temp: 37.1
        },
        findings: [
            { system: "Cardiovascular", finding: "Tachycardic, regular rhythm. S4 audible. No murmurs.", isAbnormal: true },
            { system: "Respiratory", finding: "Clear to auscultation bilaterally.", isAbnormal: false },
            { system: "Abdomen", finding: "Soft, non-tender, non-distended.", isAbnormal: false }
        ]
    },
    investigations: {
        bedside: [
            { name: "ECG", result: "ST elevation in leads II, III, aVF (Inferior MI).", abnormal: true, normalRange: "Normal Sinus Rhythm" },
            { name: "Trop I", result: "Awaiting result", abnormal: false }
        ],
        confirmatory: [
            { name: "Chest X-Ray", result: "Normal cardiac silhouette, no pulmonary edema.", abnormal: false }
        ]
    },
    management: {
        steps: [
            { action: "Administer Aspirin 300mg PO", category: "Immediate", explanation: "Antiplatelet therapy for ACS." },
            { action: "Administer Nitrates (GTN)", category: "Immediate", explanation: "Vasodilation for pain relief (caution in inferior MI)." },
            { action: "Perform 12-lead ECG", category: "Immediate", explanation: "Diagnostic confirmation." },
            { action: "Refer to Cardiology/PCI Lab", category: "Immediate", explanation: "Definitive management." }
        ],
        diagnosis: "Acute Inferior Myocardial Infarction (STEMI)"
    },
    markingScheme: {
        checklist: [
            { domain: "History", item: "Asked about onset of pain", weight: 1 },
            { domain: "History", item: "Asked about radiation", weight: 1 },
            { domain: "History", item: "Identified cardiac risk factors", weight: 1 },
            { domain: "Examination", item: "Checked vitals", weight: 1 },
            { domain: "Investigations", item: "Ordered ECG", weight: 2, critical: true },
            { domain: "Management", item: "Administered Aspirin", weight: 2, critical: true }
        ]
    }
};
