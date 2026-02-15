import mongoose from 'mongoose';
import { OsceCase } from '../schemas/caseSchema';

// Mongoose Schema Definition
// Mongoose Schema Definition
const caseSchema = new mongoose.Schema({
    // --- V1 Fields ---
    metadata: {
        title: { type: String }, // Made optional to allow V2 override or co-existence
        specialty: { type: String },
        difficulty: { type: String },
        description: { type: String },
        tags: [String],
    },
    history: {
        chiefComplaint: String,
        description: String,
        hpi: String,
        pmh: String,
        medications: String,
        allergies: String,
        socialHistory: String,
        familyHistory: String,
        reviewOfSystems: String
    },
    examination: {
        generalAppearance: String,
        vitals: {
            hr: Number,
            bp: String,
            rr: Number,
            spo2: Number,
            temp: Number
        },
        findings: [{
            system: String,
            finding: String,
            isAbnormal: Boolean
        }]
    },
    investigations: {
        bedside: [{
            name: String,
            result: String,
            normalRange: String,
            abnormal: Boolean
        }],
        confirmatory: [{
            name: String,
            result: String, // Can be text or URL
            normalRange: String,
            abnormal: Boolean
        }]
    },
    management: {
        steps: [{
            action: String,
            category: { type: String, enum: ['Immediate', 'Short-term', 'Long-term'] },
            explanation: String
        }],
        diagnosis: String
    },
    markingScheme: {
        checklist: [{
            domain: { type: String, enum: ['History', 'Examination', 'Investigations', 'Management', 'Communication'] },
            item: String,
            weight: Number,
            critical: Boolean,
            penalty: Number
        }],
        globalRating: Number
    },

    // --- V2 Fields (Loose Sctructure for Flexibility) ---
    case_metadata: { type: mongoose.Schema.Types.Mixed },
    scenario: { type: mongoose.Schema.Types.Mixed },
    truth: { type: mongoose.Schema.Types.Mixed },
    ddx_map: { type: mongoose.Schema.Types.Mixed },
    marking_scheme: { type: mongoose.Schema.Types.Mixed }
}, {
    timestamps: true, // created_at, updated_at
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: false // Allow flexible fields for V2
});

// Virtual for id to match metadata.id
caseSchema.virtual('metadata.id').get(function () {
    return this._id.toHexString();
});

export const Case = mongoose.model<OsceCase>('Case', caseSchema);
