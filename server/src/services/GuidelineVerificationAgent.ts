import { GoogleGenerativeAI } from '@google/generative-ai';

interface ClinicalDecision {
  action: string;
  context: {
    patientSymptoms: string[];
    vitalSigns?: {
      hr?: number;
      bp?: string;
      rr?: number;
      spo2?: number;
      temp?: number;
    };
    currentStage: string;
    previousActions: string[];
  };
}

interface GuidelineCheckResult {
  isValid: boolean;
  confidence: number;
  concerns: string[];
  recommendations: string[];
  guidelineReferences: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SafetyAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  action: string;
  requiresConfirmation: boolean;
}

export class GuidelineVerificationAgent {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * Validates a clinical decision against medical best practices
   * This is the core safety check for the simulation
   */
  async validateDecision(decision: ClinicalDecision): Promise<GuidelineCheckResult> {
    const prompt = `
You are a Clinical Guideline Verification Agent for a medical education simulation.
Your role is to validate clinical decisions against established medical best practices and safety protocols.

CLINICAL DECISION TO VALIDATE:
Action: ${decision.action}
Patient Context: ${JSON.stringify(decision.context, null, 2)}

VALIDATION CRITERIA:
1. Safety First: Check if the action could harm the patient
2. Evidence-Based: Verify against standard clinical guidelines
3. Appropriateness: Ensure action matches current stage and patient condition
4. Contraindications: Check for any contraindications
5. Dosing: If medication, verify appropriate dosing

CRITICAL SAFETY CHECKS:
- Never validate actions that could cause immediate harm
- Flag any deviations from standard of care
- Identify missing critical steps (e.g., ABC assessment before interventions)
- Check for appropriate escalation pathways

RESPOND IN JSON FORMAT:
{
  "isValid": boolean,
  "confidence": number (0-1),
  "concerns": [string],
  "recommendations": [string],
  "guidelineReferences": [string],
  "severity": "low" | "medium" | "high" | "critical"
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return this.createDefaultResult();
    } catch (error) {
      console.error('[GuidelineVerification] Validation error:', error);
      return this.createDefaultResult();
    }
  }

  /**
   * Generates safety alerts for high-risk clinical situations
   */
  async generateSafetyAlerts(decision: ClinicalDecision): Promise<SafetyAlert[]> {
    const prompt = `
Analyze this clinical situation for potential safety concerns:

Action: ${decision.action}
Context: ${JSON.stringify(decision.context, null, 2)}

Generate safety alerts if any of these conditions exist:
- Vital signs indicating instability
- Actions contraindicated for the patient's condition
- Missing critical assessments before treatment
- Medication interactions or allergies
- Need for immediate escalation

RESPOND IN JSON FORMAT:
{
  "alerts": [
    {
      "id": "unique-id",
      "severity": "low" | "medium" | "high" | "critical",
      "message": "Clear description of the concern",
      "action": "Recommended corrective action",
      "requiresConfirmation": boolean
    }
  ]
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.alerts || [];
      }
      
      return [];
    } catch (error) {
      console.error('[GuidelineVerification] Alert generation error:', error);
      return [];
    }
  }

  /**
   * Pre-validation check for critical safety issues
   * Returns immediately if critical issues found
   */
  async preValidate(decision: ClinicalDecision): Promise<{ allowed: boolean; reason?: string }> {
    // Critical vital signs check
    const vitals = decision.context.vitalSigns;
    if (vitals) {
      // Critical hypotension
      if (vitals.bp) {
        const systolic = parseInt(vitals.bp.split('/')[0]);
        if (systolic < 90) {
          return {
            allowed: false,
            reason: 'CRITICAL: Patient has severe hypotension (SBP < 90). Immediate ABC assessment and resuscitation required before any other intervention.'
          };
        }
      }
      
      // Critical hypoxia
      if (vitals.spo2 && vitals.spo2 < 90) {
        return {
          allowed: false,
          reason: 'CRITICAL: Patient has severe hypoxia (SpO2 < 90%). Immediate oxygen and airway management required.'
        };
      }
      
      // Critical bradycardia/tachycardia
      if (vitals.hr && (vitals.hr < 40 || vitals.hr > 150)) {
        return {
          allowed: false,
          reason: 'CRITICAL: Patient has unstable heart rate. Immediate cardiac monitoring and assessment required.'
        };
      }
    }

    // Check for inappropriate actions in early stages
    const earlyStageActions = ['surgery', 'discharge', 'prescribe medication'];
    if (decision.context.currentStage === 'History' && 
        earlyStageActions.some(action => decision.action.toLowerCase().includes(action))) {
      return {
        allowed: false,
        reason: 'Premature intervention: Complete history taking and examination before treatment decisions.'
      };
    }

    return { allowed: true };
  }

  private createDefaultResult(): GuidelineCheckResult {
    return {
      isValid: true,
      confidence: 0.5,
      concerns: [],
      recommendations: [],
      guidelineReferences: [],
      severity: 'low'
    };
  }
}

export const guidelineVerificationAgent = new GuidelineVerificationAgent();
export default GuidelineVerificationAgent;
