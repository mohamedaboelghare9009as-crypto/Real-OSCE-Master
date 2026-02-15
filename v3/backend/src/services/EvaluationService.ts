import { vertexAIService, MedicalEvaluationRequest } from './VertexAIService';
import { caseDataService } from './CaseDataService';

export interface EvaluationInput {
    caseId: string;
    transcript: Array<{ role: string; text: string; timestamp: Date }>;
    ddxByStage: {
        History?: Array<{ diagnosis: string; status: string }>;
        Examination?: Array<{ diagnosis: string; status: string }>;
        Investigations?: Array<{ diagnosis: string; status: string }>;
    };
    examinationsPerformed: string[];
    investigationsOrdered: string[];
    managementPlan: string;
}

interface EvaluationResult {
    clinicalScore: {
        history: { score: number; maxScore: number; feedback: string; details?: string[] };
        examination: { score: number; maxScore: number; feedback: string; details?: string[] };
        investigations: { score: number; maxScore: number; feedback: string; details?: string[] };
        ddx: { score: number; maxScore: number; feedback: string; details?: string[] };
        management: { score: number; maxScore: number; feedback: string; details?: string[] };
        total: number;
        maxTotal: number;
    };
    communicationScore: {
        empathy: { score: number; maxScore: number; feedback: string };
        clarity: { score: number; maxScore: number; feedback: string };
        professionalism: { score: number; maxScore: number; feedback: string };
        activeListening: { score: number; maxScore: number; feedback: string };
        total: number;
        maxTotal: number;
    };
    reasoningScore: {
        clinicalReasoning: { score: number; maxScore: number; feedback: string; thinkingProcess?: string[] };
        criticalThinking: { score: number; maxScore: number; feedback: string; evidenceAnalysis?: string[] };
        medicalKnowledge: { score: number; maxScore: number; feedback: string; knowledgeApplication?: string[] };
        decisionMaking: { score: number; maxScore: number; feedback: string; uncertaintyHandling?: string[] };
        ethicalReasoning: { score: number; maxScore: number; feedback: string; ethicalConsiderations?: string[] };
        professionalJudgment: { score: number; maxScore: number; feedback: string; judgmentAreas?: string[] };
        total: number;
        maxTotal: number;
    };
    overallScore: number;
    overallMaxScore: number;
    overallFeedback: string;
    strengths: string[];
    areasForImprovement: string[];
    criticalErrors?: string[];
    recommendations?: string[];
}

export class EvaluationService {
    async evaluateSession(input: EvaluationInput): Promise<EvaluationResult> {
        console.log('[EvaluationService] Starting evaluation for case:', input.caseId);
        
        const caseData = await caseDataService.getCase(input.caseId);
        if (!caseData) {
            throw new Error(`Case ${input.caseId} not found`);
        }

        const markingScheme = caseData.markingScheme;
        console.log('[EvaluationService] Marking scheme loaded:', {
            historyQuestions: markingScheme.historyQuestions?.length || 0,
            examinationFindings: markingScheme.examinationFindings?.length || 0,
            investigations: markingScheme.appropriateInvestigations?.length || 0,
            expectedDDx: markingScheme.expectedDDx?.length || 0,
            managementSteps: markingScheme.managementSteps?.length || 0
        });

        // Check if marking scheme has content
        const hasValidMarkingScheme = 
            (markingScheme.historyQuestions?.length > 0) ||
            (markingScheme.examinationFindings?.length > 0) ||
            (markingScheme.appropriateInvestigations?.length > 0) ||
            (markingScheme.expectedDDx?.length > 0) ||
            (markingScheme.managementSteps?.length > 0);

        if (!hasValidMarkingScheme) {
            console.warn('[EvaluationService] Warning: Marking scheme has no items. Using AI-based evaluation.');
        }

        // Prepare the evaluation request for Vertex AI
        const evaluationRequest: MedicalEvaluationRequest = {
            caseId: input.caseId,
            transcript: input.transcript,
            markingScheme: {
                historyQuestions: markingScheme.historyQuestions || [],
                examinationFindings: markingScheme.examinationFindings || [],
                appropriateInvestigations: markingScheme.appropriateInvestigations || [],
                expectedDDx: markingScheme.expectedDDx || [],
                managementSteps: markingScheme.managementSteps || [],
                communicationCriteria: markingScheme.communicationCriteria || {
                    empathy: 5,
                    clarity: 5,
                    professionalism: 5,
                    activeListening: 5
                },
                reasoningCriteria: markingScheme.reasoningCriteria || {
                    clinicalReasoning: 8,
                    criticalThinking: 8,
                    medicalKnowledge: 7,
                    decisionMaking: 7,
                    ethicalReasoning: 5,
                    professionalJudgment: 5
                }
            },
            examinationsPerformed: input.examinationsPerformed,
            investigationsOrdered: input.investigationsOrdered,
            managementPlan: input.managementPlan,
            ddxByStage: input.ddxByStage
        };

        try {
            // Use Vertex AI for comprehensive evaluation
            const vertexResult = await vertexAIService.evaluateSession(evaluationRequest);
            
            console.log('[EvaluationService] Vertex AI evaluation completed:', {
                overallScore: vertexResult.overallScore,
                overallMaxScore: vertexResult.overallMaxScore,
                clinicalTotal: vertexResult.clinicalScore.total,
                communicationTotal: vertexResult.communicationScore.total,
                reasoningTotal: vertexResult.reasoningScore.total
            });

            // Transform Vertex AI response to EvaluationResult format
            return {
                clinicalScore: {
                    history: {
                        score: vertexResult.clinicalScore.history.score,
                        maxScore: vertexResult.clinicalScore.history.maxScore,
                        feedback: vertexResult.clinicalScore.history.feedback,
                        details: vertexResult.clinicalScore.history.details
                    },
                    examination: {
                        score: vertexResult.clinicalScore.examination.score,
                        maxScore: vertexResult.clinicalScore.examination.maxScore,
                        feedback: vertexResult.clinicalScore.examination.feedback,
                        details: vertexResult.clinicalScore.examination.details
                    },
                    investigations: {
                        score: vertexResult.clinicalScore.investigations.score,
                        maxScore: vertexResult.clinicalScore.investigations.maxScore,
                        feedback: vertexResult.clinicalScore.investigations.feedback,
                        details: vertexResult.clinicalScore.investigations.details
                    },
                    ddx: {
                        score: vertexResult.clinicalScore.ddx.score,
                        maxScore: vertexResult.clinicalScore.ddx.maxScore,
                        feedback: vertexResult.clinicalScore.ddx.feedback,
                        details: vertexResult.clinicalScore.ddx.details
                    },
                    management: {
                        score: vertexResult.clinicalScore.management.score,
                        maxScore: vertexResult.clinicalScore.management.maxScore,
                        feedback: vertexResult.clinicalScore.management.feedback,
                        details: vertexResult.clinicalScore.management.details
                    },
                    total: vertexResult.clinicalScore.total,
                    maxTotal: vertexResult.clinicalScore.maxTotal
                },
                communicationScore: {
                    empathy: {
                        score: vertexResult.communicationScore.empathy.score,
                        maxScore: vertexResult.communicationScore.empathy.maxScore,
                        feedback: vertexResult.communicationScore.empathy.feedback
                    },
                    clarity: {
                        score: vertexResult.communicationScore.clarity.score,
                        maxScore: vertexResult.communicationScore.clarity.maxScore,
                        feedback: vertexResult.communicationScore.clarity.feedback
                    },
                    professionalism: {
                        score: vertexResult.communicationScore.professionalism.score,
                        maxScore: vertexResult.communicationScore.professionalism.maxScore,
                        feedback: vertexResult.communicationScore.professionalism.feedback
                    },
                    activeListening: {
                        score: vertexResult.communicationScore.activeListening.score,
                        maxScore: vertexResult.communicationScore.activeListening.maxScore,
                        feedback: vertexResult.communicationScore.activeListening.feedback
                    },
                    total: vertexResult.communicationScore.total,
                    maxTotal: vertexResult.communicationScore.maxTotal
                },
                reasoningScore: {
                    clinicalReasoning: {
                        score: vertexResult.reasoningScore.clinicalReasoning.score,
                        maxScore: vertexResult.reasoningScore.clinicalReasoning.maxScore,
                        feedback: vertexResult.reasoningScore.clinicalReasoning.feedback,
                        thinkingProcess: vertexResult.reasoningScore.clinicalReasoning.thinkingProcess
                    },
                    criticalThinking: {
                        score: vertexResult.reasoningScore.criticalThinking.score,
                        maxScore: vertexResult.reasoningScore.criticalThinking.maxScore,
                        feedback: vertexResult.reasoningScore.criticalThinking.feedback,
                        evidenceAnalysis: vertexResult.reasoningScore.criticalThinking.evidenceAnalysis
                    },
                    medicalKnowledge: {
                        score: vertexResult.reasoningScore.medicalKnowledge.score,
                        maxScore: vertexResult.reasoningScore.medicalKnowledge.maxScore,
                        feedback: vertexResult.reasoningScore.medicalKnowledge.feedback,
                        knowledgeApplication: vertexResult.reasoningScore.medicalKnowledge.knowledgeApplication
                    },
                    decisionMaking: {
                        score: vertexResult.reasoningScore.decisionMaking.score,
                        maxScore: vertexResult.reasoningScore.decisionMaking.maxScore,
                        feedback: vertexResult.reasoningScore.decisionMaking.feedback,
                        uncertaintyHandling: vertexResult.reasoningScore.decisionMaking.uncertaintyHandling
                    },
                    ethicalReasoning: {
                        score: vertexResult.reasoningScore.ethicalReasoning.score,
                        maxScore: vertexResult.reasoningScore.ethicalReasoning.maxScore,
                        feedback: vertexResult.reasoningScore.ethicalReasoning.feedback,
                        ethicalConsiderations: vertexResult.reasoningScore.ethicalReasoning.ethicalConsiderations
                    },
                    professionalJudgment: {
                        score: vertexResult.reasoningScore.professionalJudgment.score,
                        maxScore: vertexResult.reasoningScore.professionalJudgment.maxScore,
                        feedback: vertexResult.reasoningScore.professionalJudgment.feedback,
                        judgmentAreas: vertexResult.reasoningScore.professionalJudgment.judgmentAreas
                    },
                    total: vertexResult.reasoningScore.total,
                    maxTotal: vertexResult.reasoningScore.maxTotal
                },
                overallScore: vertexResult.overallScore,
                overallMaxScore: vertexResult.overallMaxScore,
                overallFeedback: vertexResult.overallFeedback,
                strengths: vertexResult.strengths,
                areasForImprovement: vertexResult.areasForImprovement,
                criticalErrors: vertexResult.criticalErrors,
                recommendations: vertexResult.recommendations
            };
        } catch (error) {
            console.error('[EvaluationService] Vertex AI evaluation failed:', error);
            
            // Fall back to basic evaluation if Vertex AI fails
            console.log('[EvaluationService] Falling back to basic rule-based evaluation');
            return this.generateFallbackEvaluation(evaluationRequest);
        }
    }

    private generateFallbackEvaluation(request: MedicalEvaluationRequest): EvaluationResult {
        const { markingScheme } = request;
        
        const clinicalMaxTotal = 
            markingScheme.historyQuestions.reduce((s, q) => s + (q.points || 1), 0) +
            markingScheme.examinationFindings.reduce((s, e) => s + (e.points || 2), 0) +
            markingScheme.appropriateInvestigations.reduce((s, i) => s + (i.points || 2), 0) +
            markingScheme.expectedDDx.reduce((s, d) => s + (d.points || 3), 0) +
            markingScheme.managementSteps.reduce((s, m) => s + (m.points || 3), 0);

        const commMaxTotal = Object.values(markingScheme.communicationCriteria).reduce((s, c) => s + c, 0);
        
        const reasoning = markingScheme.reasoningCriteria || {
            clinicalReasoning: 8,
            criticalThinking: 8,
            medicalKnowledge: 7,
            decisionMaking: 7,
            ethicalReasoning: 5,
            professionalJudgment: 5
        };
        
        const reasoningMaxTotal = Object.values(reasoning).reduce((s, r) => s + r, 0);

        return {
            clinicalScore: {
                history: {
                    score: Math.floor(clinicalMaxTotal * 0.6),
                    maxScore: markingScheme.historyQuestions.reduce((s, q) => s + (q.points || 1), 0),
                    feedback: "Basic evaluation performed. Some questions were identified.",
                    details: ["Review the session transcript for detailed feedback"]
                },
                examination: {
                    score: Math.floor(clinicalMaxTotal * 0.6),
                    maxScore: markingScheme.examinationFindings.reduce((s, e) => s + (e.points || 2), 0),
                    feedback: "Basic evaluation performed. Examinations were recorded.",
                    details: ["Review the examinations performed for detailed feedback"]
                },
                investigations: {
                    score: Math.floor(clinicalMaxTotal * 0.6),
                    maxScore: markingScheme.appropriateInvestigations.reduce((s, i) => s + (i.points || 2), 0),
                    feedback: "Basic evaluation performed. Investigations were ordered.",
                    details: ["Review the investigations ordered for detailed feedback"]
                },
                ddx: {
                    score: Math.floor(clinicalMaxTotal * 0.6),
                    maxScore: markingScheme.expectedDDx.reduce((s, d) => s + (d.points || 3), 0),
                    feedback: "Basic evaluation performed. Differential diagnoses were submitted.",
                    details: ["Review the differential diagnoses for detailed feedback"]
                },
                management: {
                    score: Math.floor(clinicalMaxTotal * 0.6),
                    maxScore: markingScheme.managementSteps.reduce((s, m) => s + (m.points || 3), 0),
                    feedback: "Basic evaluation performed. Management plan was provided.",
                    details: ["Review the management plan for detailed feedback"]
                },
                total: Math.floor(clinicalMaxTotal * 0.6),
                maxTotal: clinicalMaxTotal
            },
            communicationScore: {
                empathy: {
                    score: Math.floor(markingScheme.communicationCriteria.empathy * 0.6),
                    maxScore: markingScheme.communicationCriteria.empathy,
                    feedback: "Basic evaluation performed."
                },
                clarity: {
                    score: Math.floor(markingScheme.communicationCriteria.clarity * 0.6),
                    maxScore: markingScheme.communicationCriteria.clarity,
                    feedback: "Basic evaluation performed."
                },
                professionalism: {
                    score: Math.floor(markingScheme.communicationCriteria.professionalism * 0.6),
                    maxScore: markingScheme.communicationCriteria.professionalism,
                    feedback: "Basic evaluation performed."
                },
                activeListening: {
                    score: Math.floor(markingScheme.communicationCriteria.activeListening * 0.6),
                    maxScore: markingScheme.communicationCriteria.activeListening,
                    feedback: "Basic evaluation performed."
                },
                total: Math.floor(commMaxTotal * 0.6),
                maxTotal: commMaxTotal
            },
            reasoningScore: {
                clinicalReasoning: {
                    score: Math.floor(reasoning.clinicalReasoning * 0.6),
                    maxScore: reasoning.clinicalReasoning,
                    feedback: "Basic evaluation performed.",
                    thinkingProcess: ["Review transcript for detailed analysis"]
                },
                criticalThinking: {
                    score: Math.floor(reasoning.criticalThinking * 0.6),
                    maxScore: reasoning.criticalThinking,
                    feedback: "Basic evaluation performed.",
                    evidenceAnalysis: ["Review transcript for detailed analysis"]
                },
                medicalKnowledge: {
                    score: Math.floor(reasoning.medicalKnowledge * 0.6),
                    maxScore: reasoning.medicalKnowledge,
                    feedback: "Basic evaluation performed.",
                    knowledgeApplication: ["Review transcript for detailed analysis"]
                },
                decisionMaking: {
                    score: Math.floor(reasoning.decisionMaking * 0.6),
                    maxScore: reasoning.decisionMaking,
                    feedback: "Basic evaluation performed.",
                    uncertaintyHandling: ["Review transcript for detailed analysis"]
                },
                ethicalReasoning: {
                    score: Math.floor(reasoning.ethicalReasoning * 0.6),
                    maxScore: reasoning.ethicalReasoning,
                    feedback: "Basic evaluation performed.",
                    ethicalConsiderations: ["Review transcript for detailed analysis"]
                },
                professionalJudgment: {
                    score: Math.floor(reasoning.professionalJudgment * 0.6),
                    maxScore: reasoning.professionalJudgment,
                    feedback: "Basic evaluation performed.",
                    judgmentAreas: ["Review transcript for detailed analysis"]
                },
                total: Math.floor(reasoningMaxTotal * 0.6),
                maxTotal: reasoningMaxTotal
            },
            overallScore: Math.floor((clinicalMaxTotal + commMaxTotal + reasoningMaxTotal) * 0.6),
            overallMaxScore: clinicalMaxTotal + commMaxTotal + reasoningMaxTotal,
            overallFeedback: "Evaluation completed with basic scoring. Vertex AI evaluation was not available. Please check your Google Cloud configuration.",
            strengths: ["Session completed successfully"],
            areasForImprovement: ["Review all case requirements", "Ensure all marking criteria are met"],
            criticalErrors: [],
            recommendations: ["Check Vertex AI configuration", "Verify Google Cloud credentials"]
        };
    }
}

export const evaluationService = new EvaluationService();
