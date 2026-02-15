import mongoose, { Schema, Document } from 'mongoose';

export interface ISimulationState extends Document {
    sessionId: string;
    patientId: string;
    nurseId: string;
    vitals: {
        heartRate: number;
        bloodPressure: string;
        oxygenSaturation: number;
        temperature: number;
    };
    currentMeds: string[];
    revealedFacts: string[];
    physicalExamFindings: Array<{ system: string; finding: string }>;
    investigationResults: Array<{ test: string; result: string; category: string }>;
    managementPlan: string;
    ddxByStage: {
        History?: Array<{ diagnosis: string; status: string }>;
        Examination?: Array<{ diagnosis: string; status: string }>;
        Investigations?: Array<{ diagnosis: string; status: string }>;
    };
    transcript: Array<{ role: string; text: string; timestamp: Date }>;
    evaluationScore?: any;
    emotionalState: string;
    stage: 'History' | 'Examination' | 'Investigations' | 'Management' | 'End';
    lastInteraction: Date;
}

const SimulationStateSchema: Schema = new Schema({
    sessionId: { type: String, required: true, unique: true },
    patientId: { type: String, required: true },
    nurseId: { type: String, required: true },
    vitals: {
        heartRate: { type: Number, default: 80 },
        bloodPressure: { type: String, default: "120/80" },
        oxygenSaturation: { type: Number, default: 98 },
        temperature: { type: Number, default: 37.0 }
    },
    currentMeds: [{ type: String }],
    revealedFacts: [{ type: String }],
    physicalExamFindings: [{
        system: String,
        finding: String
    }],
    investigationResults: [{
        test: String,
        result: String,
        category: String
    }],
    managementPlan: { type: String, default: "" },
    ddxByStage: {
        History: [{ diagnosis: String, status: String }],
        Examination: [{ diagnosis: String, status: String }],
        Investigations: [{ diagnosis: String, status: String }]
    },
    transcript: [{
        role: String,
        text: String,
        timestamp: Date
    }],
    evaluationScore: { type: Schema.Types.Mixed },
    emotionalState: { type: String, default: 'Neutral' },
    stage: { type: String, enum: ['History', 'Examination', 'Investigations', 'Management', 'End'], default: 'History' },
    lastInteraction: { type: Date, default: Date.now }
}, { timestamps: true });

export const SimulationState = mongoose.model<ISimulationState>('SimulationState', SimulationStateSchema);
