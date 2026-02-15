import mongoose from 'mongoose';
import { SessionState } from '../schemas/sessionSchema';
import { CaseStage } from '../schemas/caseSchema';

const sessionSchema = new mongoose.Schema<SessionState>({
    userId: { type: String, required: true },
    caseId: { type: String, required: true }, // Keeping as string to avoid strict populate requirement if not needed
    currentStage: {
        type: String,
        enum: ['History', 'Examination', 'Investigations', 'Management'],
        default: 'History'
    },
    completedStages: [{
        type: String,
        enum: ['History', 'Examination', 'Investigations', 'Management']
    }],
    actionsTaken: [{
        action: String,
        stage: String,
        pointsAwarded: Number,
        timestamp: Date,
        details: mongoose.Schema.Types.Mixed
    }],
    scoreTotal: { type: Number, default: 0 },
    criticalFlags: { type: [String], default: [] },
    failedStage: { type: Boolean, default: false },
    startTime: { type: Date, default: Date.now },
    lastInteraction: { type: Date, default: Date.now },
    isCompleted: { type: Boolean, default: false },
    revealedFacts: { type: [String], default: [] },
    transcript: [{
        role: String,
        text: String,
        timestamp: { type: Date, default: Date.now }
    }]
});

export const Session = mongoose.model<SessionState>('Session', sessionSchema);
