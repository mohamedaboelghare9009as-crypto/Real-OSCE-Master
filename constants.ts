import { Case, StageId } from './types';

export const MOCK_CASES: Case[] = [
  // ... existing cases ...
  {
    id: 'c1',
    title: 'Acute Chest Pain',
    specialty: 'Internal Medicine',
    difficulty: 'Intermediate',
    description: 'A 55-year-old male presents to the ED with sudden onset retrosternal chest pain.',
    chiefComplaint: "My chest feels like there's an elephant sitting on it.",
    vitals: { hr: 110, bp: '145/92', rr: 22, spo2: 96, temp: 98.9 },
    patientAvatar: 'https://picsum.photos/400/400?random=1',
    tags: ['Cardiology', 'Emergency', 'High Yield'],
    systemInstruction: `You are a 55-year-old male named Robert Thorne. 
    You are in the Emergency Department.
    Chief Complaint: "Chest pain started about 45 minutes ago while I was mowing the lawn."
    HPI: The pain is central, crushing (8/10), radiates to the left jaw. You feel nauseous and sweaty.
    PMH: Hypertension, High Cholesterol, Smoker (1 pack/day for 30 years).
    Meds: Lisinopril, Atorvastatin (sometimes you forget to take them).
    Family Hx: Father died of MI at 60.
    Behavior: Anxious but cooperative. 
    Rules: 
    1. Do NOT volunteer information unless asked. 
    2. Respond briefly and naturally. 
    3. If the user acts as a doctor, treat them as such.
    4. You are scared you are having a heart attack.`
  },
  {
    id: 'c2',
    title: 'Pediatric Fever & Rash',
    specialty: 'Pediatrics',
    difficulty: 'Novice',
    description: 'A concerned mother brings in her 4-year-old son with a 3-day history of fever.',
    chiefComplaint: "He's been burning up and now has this spotty rash.",
    vitals: { hr: 120, bp: '90/60', rr: 28, spo2: 98, temp: 102.4 },
    patientAvatar: 'https://picsum.photos/400/400?random=2',
    tags: ['Infectious Disease', 'Pediatrics'],
    systemInstruction: `You are simulating the mother (Sarah) of a 4-year-old boy named Leo.
    Chief Complaint: Leo has had a fever for 3 days, max 103F. Today he woke up with a pink rash on his trunk.
    HPI: He has a runny nose and slight cough. Eating less, drinking okay. No vomiting.
    PMH: None. Vaccinations up to date.
    Behavior: Worried mother, asking questions like "Is it measles?"
    Rules: Be protective. Answer questions about Leo clearly.`
  },
  {
    id: 'c3',
    title: 'Altered Mental Status',
    specialty: 'Emergency',
    difficulty: 'Expert',
    description: '72-year-old female brought in by EMS after being found confused at home.',
    chiefComplaint: "(Patient is confused/somnolent)",
    vitals: { hr: 105, bp: '88/50', rr: 24, spo2: 91, temp: 96.5 },
    patientAvatar: 'https://picsum.photos/400/400?random=3',
    tags: ['Geriatrics', 'Sepsis', 'Neurology'],
    systemInstruction: `You are a 72-year-old female named Margaret. You are confused.
    You don't know where you are. You think it is 1985.
    You complain of feeling very cold and maybe your lower belly hurts if pressed.
    You are likely septic from a UTI.
    Rules: Act confused. Give vague answers. Mumble occasionally.`
  }
];

export const NAV_LINKS = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Cases', path: '/cases' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Calendar', path: '/calendar' },
  { label: 'Upgrade to Pro', path: '/subscribe' },
];

export const STAGE_ORDER = [
  StageId.HISTORY,
  StageId.PHYSICAL,
  StageId.INITIAL_INV,
  StageId.CONFIRMATORY_INV,
];

export const STAGE_LABELS: Record<StageId, string> = {
  [StageId.HISTORY]: "History Taking",
  [StageId.PHYSICAL]: "Physical Examination",
  [StageId.INITIAL_INV]: "Initial Investigations",
  [StageId.CONFIRMATORY_INV]: "Confirmatory Investigations",
};

export const EXAM_SYSTEMS = [
  "General Appearance",
  "Cardiovascular",
  "Respiratory",
  "Abdominal",
  "Neurological",
  "Musculoskeletal",
];

// Mock Data for Simulation
export const MOCK_HISTORY_POINTS = [
  { id: '1', category: 'chronology', text: 'Chest pain started 2 hours ago while gardening.', timestamp: Date.now() },
  { id: '2', category: 'symptom', text: 'Pain is central, crushing, rated 8/10.', timestamp: Date.now() },
  { id: '3', category: 'associated', text: 'Associated nausea and diaphoresis.', timestamp: Date.now() },
  { id: '4', category: 'risk_factor', text: 'Patient has history of hypertension and hyperlipidemia.', timestamp: Date.now() },
  { id: '5', category: 'chronology', text: 'Pain radiates to the left jaw.', timestamp: Date.now() },
];

export const MOCK_EXAM_FINDINGS = {
  "Cardiovascular": [
    { id: 'c1', system: 'Cardiovascular', finding: 'Heart rate 110 bpm, regular', isPositive: true },
    { id: 'c2', system: 'Cardiovascular', finding: 'S4 gallop present', isPositive: true },
    { id: 'c3', system: 'Cardiovascular', finding: 'No murmurs or rubs', isPositive: false },
  ],
  "Respiratory": [
    { id: 'r1', system: 'Respiratory', finding: 'Respiratory rate 22/min', isPositive: true },
    { id: 'r2', system: 'Respiratory', finding: 'Bilateral basal crackles', isPositive: true },
    { id: 'r3', system: 'Respiratory', finding: 'No wheezing', isPositive: false },
  ],
  "General Appearance": [
    { id: 'g1', system: 'General Appearance', finding: 'Patient appears anxious and diaphoretic', isPositive: true },
    { id: 'g2', system: 'General Appearance', finding: 'Clutching chest', isPositive: true },
  ]
};

export const MOCK_LAB_RESULTS = [
  { id: 'l1', testName: 'Troponin I', value: '2.5', unit: 'ng/mL', range: '<0.04', flag: 'critical' },
  { id: 'l2', testName: 'ECG', value: 'ST Elevation II, III, aVF', flag: 'critical' },
  { id: 'l3', testName: 'Hemoglobin', value: '14.5', unit: 'g/dL', range: '13.5-17.5', flag: 'normal' },
  { id: 'l4', testName: 'WBC', value: '11.2', unit: 'x10^3/uL', range: '4.5-11.0', flag: 'high' },
];