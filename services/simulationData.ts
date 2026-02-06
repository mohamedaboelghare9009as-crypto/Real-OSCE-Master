
export interface ResponseString {
    trigger: string;
    response: string;
}

export interface ExamFinding {
    id: string;
    system: string;
    maneuver: string;
    finding: string;
    isAbnormal: boolean;
}

export interface Investigation {
    id: string;
    name: string;
    category: 'Bedside' | 'Lab' | 'Imaging';
    result: string;
    reference?: string;
    isAbnormal: boolean;
    cost: number; // time cost in minutes
}

export const RESPONSE_STRINGS: ResponseString[] = [
    { trigger: 'pain', response: "It's a heavy, crushing pain in the center of my chest. Like an elephant sitting on me." },
    { trigger: 'radiate', response: "Yes, it goes down my left arm and up to my jaw." },
    { trigger: 'breath', response: "I feel very short of breath, especially when I lie down." },
    { trigger: 'nausea', response: "I felt sick earlier and threw up once." },
    { trigger: 'history', response: "I have high blood pressure and high cholesterol. My dad died of a heart attack at 60." },
    { trigger: 'allergies', response: "I'm allergic to Penicillin." },
    { trigger: 'smoke', response: "I smoke about a pack a day for 30 years." },
    { trigger: 'alcohol', response: "Just a few beers on the weekend." },
];

export const EXAMINATION_FINDINGS: ExamFinding[] = [
    { id: 'e1', system: 'Cardiovascular', maneuver: 'Auscultation', finding: 'S1, S2 normal. No murmurs. S4 gallop present.', isAbnormal: true },
    { id: 'e2', system: 'Respiratory', maneuver: 'Auscultation', finding: 'Bilateral basal crackles. No wheeze.', isAbnormal: true },
    { id: 'e3', system: 'General', maneuver: 'Appearance', finding: 'Patient is diaphoretic, pale, and clutching chest.', isAbnormal: true },
    { id: 'e4', system: 'Constitutional', maneuver: 'Vitals', finding: 'BP 150/95, HR 110, RR 24, SpO2 96% on RA, Temp 37.2°C', isAbnormal: true },
    { id: 'e5', system: 'Abdominal', maneuver: 'Palpation', finding: 'Soft, non-tender. No organomegaly.', isAbnormal: false },
    { id: 'e6', system: 'Extremities', maneuver: 'Inspection', finding: 'No pedal edema. Capillary refill <2s.', isAbnormal: false },
];

export const INVESTIGATION_LIBRARY: Investigation[] = [
    { id: 'i1', name: 'ECG 12-Lead Electrocardiogram', category: 'Bedside', result: 'Sinus Tachycardia. ST elevation >2mm in V1-V4.', isAbnormal: true, cost: 5 },
    { id: 'i2', name: 'Troponin T Cardiac Enzyme', category: 'Lab', result: '450 ng/L', reference: '<14 ng/L', isAbnormal: true, cost: 60 },
    { id: 'i3', name: 'CXR Chest X-Ray', category: 'Imaging', result: 'Normal cardiac silhouette. Mild pulmonary vascular congestion.', isAbnormal: true, cost: 30 },
    { id: 'i4', name: 'FBC Full Blood Count', category: 'Lab', result: 'Hb 145, WCC 11.2, Plt 280.', reference: 'Normal', isAbnormal: false, cost: 45 },
    { id: 'i5', name: 'U&Es Urea & Electrolytes', category: 'Lab', result: 'Na 140, K 4.2, Urea 6.0, Cr 90.', reference: 'Normal', isAbnormal: false, cost: 45 },
    { id: 'i6', name: 'D-Dimer', category: 'Lab', result: '<250 ng/mL', reference: '<500', isAbnormal: false, cost: 45 },
];

export const GOLD_STANDARD_DIAGNOSIS = "Acute Anterior STEMI";

export const SIMULATION_CONSTANTS = {
    CASE_ID: 'c1',
    PATIENT_NAME: 'James Anderson',
    AGE: 58,
    SEX: 'Male',
    MRN: '998210'
};
