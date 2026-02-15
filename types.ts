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
  currentPhase: 'history' | 'exam' | 'labs' | 'confirm';
  isRecording: boolean;
  timeRemaining: number;
}

export interface HistoryItem {
  id: string;
  label: string;
  value: string;
  isExtracted: boolean;
}

export interface LabResult {
  label: string;
  value: string;
  unit?: string;
  status?: 'normal' | 'high' | 'low';
}

export interface LabPanel {
  id: string;
  title: string;
  results: LabResult[];
}

export interface CompetencyScore {
  category: string;
  score: number; // 0-100
  fullMark: number;
}
