export interface Case {
  id: string;
  title: string;
  specialty: 'Internal Medicine' | 'Surgery' | 'Pediatrics' | 'OB/GYN' | 'Psychiatry' | 'Emergency';
  difficulty: 'Novice' | 'Intermediate' | 'Expert';
  description: string;
  chiefComplaint: string;
  vitals: {
    hr: number;
    bp: string;
    rr: number;
    spo2: number;
    temp: number;
  };
  patientAvatar: string;
  systemInstruction: string;
  tags: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'nurse' | 'system';
  text: string;
  timestamp: Date;
}

export interface VitalsData {
  hr: number;
  sbp: number; // systolic
  dbp: number; // diastolic
  rr: number;
  spo2: number;
  temp: number;
}

export enum StageId {
  HISTORY = 'history',
  PHYSICAL = 'physical',
  INITIAL_INV = 'initial_inv',
  CONFIRMATORY_INV = 'confirmatory_inv',
}

export enum StageStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

export enum PatientEmotion {
  NEUTRAL = 'neutral',
  PAIN = 'pain',
  ANXIOUS = 'anxious',
  SPEAKING = 'speaking',
  LISTENING = 'listening',
}

export interface HistoryPoint {
  id: string;
  category: 'symptom' | 'chronology' | 'associated' | 'risk_factor' | 'question';
  text: string;
  timestamp: number;
}

export interface ExamFinding {
  id: string;
  system: string;
  finding: string;
  isPositive: boolean;
}

export interface LabResult {
  id: string;
  testName: string;
  value: string;
  unit?: string;
  range?: string;
  flag?: 'high' | 'low' | 'critical' | 'normal';
}

export interface LabPanel {
  id: string;
  title: string;
  results: LabResult[];
}

export interface SimulationState {
  activeStage: StageId;
  patientEmotion: PatientEmotion;
  isMicActive: boolean;
  historyPoints: HistoryPoint[];
  examFindings: ExamFinding[];
  labResults: LabResult[];
  completedStages: StageId[];
}

export interface CompetencyScore {
  category: string;
  score: number; // 0-100
  fullMark: number;
}
