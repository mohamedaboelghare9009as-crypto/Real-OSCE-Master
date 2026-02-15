import mongoose from 'mongoose';
import { Case } from '../models/Case';

export interface MarkingScheme {
    // Standard criteria (V2 format)
    historyQuestions: Array<{ question: string; points: number; category: string }>;
    examinationFindings: Array<{ system: string; finding: string; points: number }>;
    appropriateInvestigations: Array<{ test: string; points: number; category: string }>;
    expectedDDx: Array<{ diagnosis: string; rank: number; points: number }>;
    managementSteps: Array<{ step: string; points: number; category: string }>;
    
    // Communication & Non-Clinical Skills (V2 format)
    communicationCriteria: {
        empathy: number;
        clarity: number;
        professionalism: number;
        activeListening: number;
    };
    
    // Deep Non-Clinical Skills (NEW - thinking & reasoning)
    reasoningCriteria: {
        clinicalReasoning: number;
        criticalThinking: number;
        medicalKnowledge: number;
        decisionMaking: number;
        ethicalReasoning: number;
        professionalJudgment: number;
    };
    
    // V1 format support (checklist-based)
    checklist?: Array<{
        domain: string;
        item: string;
        weight: number;
        critical?: boolean;
        penalty?: number;
    }>;
    
    totalPoints: number;
}

export interface CaseData {
    caseId: string;
    vitals: {
        heartRate: number;
        bloodPressure: string;
        oxygenSaturation: number;
        temperature: number;
    } | null;
    physicalExam: Array<{ system: string; finding: string; keywords: string[] }>;
    investigations: Array<{ test: string; result: string; category: string; keywords: string[] }>;
    management: string;
    markingScheme: MarkingScheme;
}

export class CaseDataService {
    private cache: Map<string, CaseData> = new Map();

    constructor() {
        // Initialize with default mock if needed, but primary source is DB
    }

    async getCase(caseId: string): Promise<CaseData | null> {
        // 1. Check Cache
        if (this.cache.has(caseId)) return this.cache.get(caseId)!;

        // 2. Fetch from DB
        try {
            // Try to find by case_metadata.case_id (V2) or _id (V1)
            let dbCase = await Case.findOne({ "case_metadata.case_id": caseId });
            if (!dbCase && mongoose.isValidObjectId(caseId)) {
                dbCase = await Case.findById(caseId);
            }

            if (!dbCase) {
                console.warn(`[CaseDataService] Case ${caseId} not found in DB. Falling back to default.`);
                return this.getDefaultCase();
            }

            const mappedData = this.mapDbCaseToCaseData(dbCase.toObject());
            this.cache.set(caseId, mappedData);
            return mappedData;
        } catch (error) {
            console.error(`[CaseDataService] Error fetching case ${caseId}:`, error);
            return this.getDefaultCase();
        }
    }

    private mapDbCaseToCaseData(dbCase: any): CaseData {
        const isV2 = !!dbCase.case_metadata;

        if (isV2) {
            const truth = dbCase.truth || {};
            const marking = dbCase.marking_scheme || {};

            // Map Vitals (V2)
            let vitals = null;
            if (truth.physical_exam?.vitals) {
                vitals = {
                    heartRate: truth.physical_exam.vitals.hr || 80,
                    bloodPressure: truth.physical_exam.vitals.bp || "120/80",
                    oxygenSaturation: truth.physical_exam.vitals.spo2 || 98,
                    temperature: truth.physical_exam.vitals.temp || 37.0
                };
            }

            // Map Physical Exam
            const physicalExam: any[] = [];
            const pe = truth.physical_exam || {};
            Object.entries(pe).forEach(([system, finding]) => {
                if (system !== 'vitals' && typeof finding === 'string') {
                    const sysLower = system.toLowerCase();
                    const keywords = [sysLower, 'exam', 'look'];

                    // Add common abbreviations
                    if (sysLower === 'cardiovascular') keywords.push('cvs', 'heart');
                    if (sysLower === 'respiratory') keywords.push('resp', 'lung', 'chest');
                    if (sysLower === 'abdomen') keywords.push('abd', 'stomach');
                    if (sysLower === 'neurological') keywords.push('neuro', 'nerves');
                    if (sysLower === 'general') keywords.push('appearance', 'look');

                    physicalExam.push({
                        system: system.charAt(0).toUpperCase() + system.slice(1),
                        finding,
                        keywords
                    });
                }
            });

            // Map Investigations
            const investigations: any[] = [];
            const inv = truth.investigations || {};
            ['bedside', 'confirmatory'].forEach(cat => {
                if (inv[cat]) {
                    Object.entries(inv[cat]).forEach(([test, result]) => {
                        investigations.push({
                            test: test.charAt(0).toUpperCase() + test.slice(1),
                            result,
                            category: cat.charAt(0).toUpperCase() + cat.slice(1),
                            keywords: [test.toLowerCase(), 'order', 'check']
                        });
                    });
                }
            });

            return {
                caseId: dbCase.case_metadata.case_id,
                vitals,
                physicalExam,
                investigations,
                management: dbCase.scenario?.candidate_instructions || "",
                markingScheme: this.mapMarkingScheme(marking)
            };
        } else {
            // V1 Mapping
            let vitals = null;
            if (dbCase.examination?.vitals) {
                vitals = {
                    heartRate: dbCase.examination.vitals.hr || 80,
                    bloodPressure: dbCase.examination.vitals.bp || "120/80",
                    oxygenSaturation: dbCase.examination.vitals.spo2 || 98,
                    temperature: dbCase.examination.vitals.temp || 37.0
                };
            }

            return {
                caseId: dbCase.metadata?.id || 'unknown',
                vitals,
                physicalExam: (dbCase.examination?.findings || []).map((f: any) => ({
                    system: f.system,
                    finding: f.finding,
                    keywords: [f.system.toLowerCase()]
                })),
                investigations: [
                    ...(dbCase.investigations?.bedside || []).map((i: any) => ({ ...i, test: i.name, category: 'Bedside', keywords: [i.name.toLowerCase()] })),
                    ...(dbCase.investigations?.confirmatory || []).map((i: any) => ({ ...i, test: i.name, category: 'Confirmatory', keywords: [i.name.toLowerCase()] }))
                ],
                management: dbCase.management?.diagnosis || "",
                markingScheme: dbCase.markingScheme || {} as any
            };
        }
    }

    private mapMarkingScheme(marking: any): MarkingScheme {
        if (!marking) {
            console.warn('[CaseDataService] No marking scheme provided, using defaults');
            return this.getDefaultMarkingScheme();
        }

        // Check if this is V1 format (checklist-based)
        if (marking.checklist && Array.isArray(marking.checklist)) {
            console.log('[CaseDataService] Detected V1 marking scheme format');
            return this.mapV1MarkingScheme(marking);
        }

        // Map history questions from marking scheme
        const historyQuestions: Array<{ question: string; points: number; category: string }> = [];
        if (marking.history) {
            Object.entries(marking.history).forEach(([category, questions]) => {
                if (Array.isArray(questions)) {
                    questions.forEach((q: string) => {
                        historyQuestions.push({
                            question: q,
                            points: 1, // Default points per question
                            category: category
                        });
                    });
                }
            });
        }

        // Map physical exam findings
        const examinationFindings: Array<{ system: string; finding: string; points: number }> = [];
        if (marking.physical_exam) {
            Object.entries(marking.physical_exam).forEach(([system, finding]) => {
                if (typeof finding === 'string') {
                    examinationFindings.push({
                        system: system.charAt(0).toUpperCase() + system.slice(1),
                        finding: finding,
                        points: 2 // Default points per exam
                    });
                }
            });
        }

        // Map investigations
        const appropriateInvestigations: Array<{ test: string; points: number; category: string }> = [];
        if (marking.investigations) {
            if (marking.investigations.bedside && Array.isArray(marking.investigations.bedside)) {
                marking.investigations.bedside.forEach((test: string) => {
                    appropriateInvestigations.push({
                        test: test.charAt(0).toUpperCase() + test.slice(1),
                        points: 2,
                        category: 'Bedside'
                    });
                });
            }
            if (marking.investigations.confirmatory && Array.isArray(marking.investigations.confirmatory)) {
                marking.investigations.confirmatory.forEach((test: string) => {
                    appropriateInvestigations.push({
                        test: test.charAt(0).toUpperCase() + test.slice(1),
                        points: 3,
                        category: 'Confirmatory'
                    });
                });
            }
        }

        // Map expected differential diagnoses
        const expectedDDx: Array<{ diagnosis: string; rank: number; points: number }> = [];
        if (marking.ddx && marking.ddx.expected) {
            if (Array.isArray(marking.ddx.expected)) {
                marking.ddx.expected.forEach((diagnosis: string, index: number) => {
                    expectedDDx.push({
                        diagnosis,
                        rank: index + 1,
                        points: Math.max(5 - index, 1) // 5 points for #1, decreasing
                    });
                });
            }
        }

        // Map management steps
        const managementSteps: Array<{ step: string; points: number; category: string }> = [];
        if (marking.management) {
            Object.entries(marking.management).forEach(([category, steps]) => {
                if (Array.isArray(steps)) {
                    steps.forEach((step: string) => {
                        managementSteps.push({
                            step,
                            points: category === 'immediate' ? 5 : 3,
                            category: category.charAt(0).toUpperCase() + category.slice(1)
                        });
                    });
                }
            });
        }

        // Map communication criteria
        const communicationCriteria = {
            empathy: marking.communication?.empathy || 5,
            clarity: marking.communication?.clarity || 5,
            professionalism: marking.communication?.professionalism || 5,
            activeListening: marking.communication?.active_listening || 5
        };

        // Map reasoning/non-clinical skills criteria
        const reasoningCriteria = {
            clinicalReasoning: marking.reasoning?.clinical_reasoning || marking.reasoning?.clinicalReasoning || 8,
            criticalThinking: marking.reasoning?.critical_thinking || marking.reasoning?.criticalThinking || 8,
            medicalKnowledge: marking.reasoning?.medical_knowledge || marking.reasoning?.medicalKnowledge || 7,
            decisionMaking: marking.reasoning?.decision_making || marking.reasoning?.decisionMaking || 7,
            ethicalReasoning: marking.reasoning?.ethical_reasoning || marking.reasoning?.ethicalReasoning || 5,
            professionalJudgment: marking.reasoning?.professional_judgment || marking.reasoning?.professionalJudgment || 5
        };

        // Calculate total points
        const totalPoints = 
            historyQuestions.reduce((sum, q) => sum + q.points, 0) +
            examinationFindings.reduce((sum, e) => sum + e.points, 0) +
            appropriateInvestigations.reduce((sum, i) => sum + i.points, 0) +
            expectedDDx.reduce((sum, d) => sum + d.points, 0) +
            managementSteps.reduce((sum, m) => sum + m.points, 0) +
            Object.values(communicationCriteria).reduce((sum, c) => sum + c, 0) +
            Object.values(reasoningCriteria).reduce((sum, r) => sum + r, 0);

        console.log(`[CaseDataService] Mapped marking scheme with ${totalPoints} total points:`, {
            historyQuestions: historyQuestions.length,
            examinationFindings: examinationFindings.length,
            appropriateInvestigations: appropriateInvestigations.length,
            expectedDDx: expectedDDx.length,
            managementSteps: managementSteps.length,
            reasoningCriteria: Object.keys(reasoningCriteria).length
        });

        return {
            historyQuestions,
            examinationFindings,
            appropriateInvestigations,
            expectedDDx,
            managementSteps,
            communicationCriteria,
            reasoningCriteria,
            totalPoints: totalPoints || 100
        };
    }

    private mapV1MarkingScheme(marking: any): MarkingScheme {
        const checklist = marking.checklist || [];
        
        // Extract items by domain
        const historyQuestions: Array<{ question: string; points: number; category: string }> = [];
        const examinationFindings: Array<{ system: string; finding: string; points: number }> = [];
        const appropriateInvestigations: Array<{ test: string; points: number; category: string }> = [];
        const managementSteps: Array<{ step: string; points: number; category: string }> = [];
        
        checklist.forEach((item: any) => {
            const points = item.weight || 1;
            
            switch (item.domain?.toLowerCase()) {
                case 'history':
                    historyQuestions.push({
                        question: item.item,
                        points,
                        category: 'HPI'
                    });
                    break;
                case 'examination':
                    examinationFindings.push({
                        system: item.item.split(' ')[0] || 'General',
                        finding: item.item,
                        points
                    });
                    break;
                case 'investigations':
                    appropriateInvestigations.push({
                        test: item.item,
                        points,
                        category: 'Investigation'
                    });
                    break;
                case 'management':
                    managementSteps.push({
                        step: item.item,
                        points,
                        category: 'Management'
                    });
                    break;
            }
        });

        // Communication criteria from V1 (could be in checklist or separate)
        const communicationCriteria = {
            empathy: 5,
            clarity: 5,
            professionalism: 5,
            activeListening: 5
        };

        // Reasoning/non-clinical skills for V1
        const reasoningCriteria = {
            clinicalReasoning: 8,
            criticalThinking: 8,
            medicalKnowledge: 7,
            decisionMaking: 7,
            ethicalReasoning: 5,
            professionalJudgment: 5
        };

        const totalPoints = 
            checklist.reduce((sum: number, item: any) => sum + (item.weight || 1), 0) +
            Object.values(communicationCriteria).reduce((sum, c) => sum + c, 0) +
            Object.values(reasoningCriteria).reduce((sum, r) => sum + r, 0);

        return {
            historyQuestions,
            examinationFindings,
            appropriateInvestigations,
            expectedDDx: [], // V1 may not have structured DDx
            managementSteps,
            communicationCriteria,
            reasoningCriteria,
            checklist: marking.checklist,
            totalPoints
        };
    }

    private getDefaultMarkingScheme(): MarkingScheme {
        return {
            historyQuestions: [],
            examinationFindings: [],
            appropriateInvestigations: [],
            expectedDDx: [],
            managementSteps: [],
            communicationCriteria: { empathy: 5, clarity: 5, professionalism: 5, activeListening: 5 },
            reasoningCriteria: {
                clinicalReasoning: 8,
                criticalThinking: 8,
                medicalKnowledge: 7,
                decisionMaking: 7,
                ethicalReasoning: 5,
                professionalJudgment: 5
            },
            totalPoints: 60
        };
    }

    async findExamFinding(caseId: string, query: string) {
        const caseData = await this.getCase(caseId);
        if (!caseData) return null;
        const lowerQuery = query.toLowerCase();
        return caseData.physicalExam.find(f => f.keywords.some(k => lowerQuery.includes(k)));
    }

    async findInvestigation(caseId: string, query: string) {
        const caseData = await this.getCase(caseId);
        if (!caseData) return null;
        const lowerQuery = query.toLowerCase();
        return caseData.investigations.find(i => i.keywords.some(k => lowerQuery.includes(k)));
    }

    private getDefaultCase(): CaseData {
        return {
            caseId: 'default',
            vitals: {
                heartRate: 78,
                bloodPressure: "120/80",
                oxygenSaturation: 98,
                temperature: 37.0
            },
            physicalExam: [
                { system: 'General', finding: 'Patient appears pale and slightly diaphoretic.', keywords: ['general', 'look', 'appear'] },
                { system: 'Cardiovascular', finding: 'Tachycardia (105 bpm). S1 S2 heard, no murmurs.', keywords: ['heart', 'cvs', 'chest', 'cardiac'] }
            ],
            investigations: [],
            management: "Default management",
            markingScheme: {
                historyQuestions: [],
                examinationFindings: [],
                appropriateInvestigations: [],
                expectedDDx: [],
                managementSteps: [],
                communicationCriteria: { empathy: 5, clarity: 5, professionalism: 5, activeListening: 5 },
                reasoningCriteria: {
                    clinicalReasoning: 8,
                    criticalThinking: 8,
                    medicalKnowledge: 7,
                    decisionMaking: 7,
                    ethicalReasoning: 5,
                    professionalJudgment: 5
                },
                totalPoints: 60
            }
        };
    }
}

export const caseDataService = new CaseDataService();
