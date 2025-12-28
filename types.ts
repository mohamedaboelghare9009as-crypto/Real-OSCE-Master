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

export interface SessionState {
  isRecording: boolean;
  phase: 'history' | 'physical' | 'tests' | 'management';
  timeRemaining: number; // seconds
}

export interface CompetencyScore {
  category: string;
  score: number; // 0-100
  fullMark: number;
}
