import mongoose from 'mongoose';

const CaseSchema = new mongoose.Schema({
    // V1 fields
    metadata: { type: mongoose.Schema.Types.Mixed },
    history: { type: mongoose.Schema.Types.Mixed },
    examination: { type: mongoose.Schema.Types.Mixed },
    investigations: { type: mongoose.Schema.Types.Mixed },
    management: { type: mongoose.Schema.Types.Mixed },
    markingScheme: { type: mongoose.Schema.Types.Mixed },

    // V2 fields
    case_metadata: { type: mongoose.Schema.Types.Mixed },
    scenario: { type: mongoose.Schema.Types.Mixed },
    truth: { type: mongoose.Schema.Types.Mixed },
    ddx_map: { type: mongoose.Schema.Types.Mixed },
    marking_scheme: { type: mongoose.Schema.Types.Mixed }
}, {
    timestamps: true,
    strict: false // Allow for flexible extension
});

// Since v3 connects to its own DB by default in index.ts, 
// if we want to share the DB, we must ensure MONGO_URI is shared.
export const Case = mongoose.model('Case', CaseSchema);
