import mongoose from 'mongoose';
import { Case } from '../models/Case';
import { connectDB } from '../config/db';
import dotenv from 'dotenv';
import path from 'path';

// Load Env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const peCase = {
    metadata: {
        title: 'Acute Shortness of Breath',
        specialty: 'Respiratory',
        difficulty: 'Intermediate',
        description: 'A 62-year-old male presents with sudden onset shortness of breath and chest pain.',
        tags: ['respiratory', 'emergency', 'chest pain']
    },
    history: {
        chiefComplaint: 'Sudden shortness of breath and right-sided chest pain.',
        description: 'Mr. John Smith, a 62-year-old retired accountant, presents to the ED compliant of sudden onset dyspnea and sharp, pleuritic right-sided chest pain which started 2 hours ago while he was watching TV.',
        hpi: 'The pain is sharp, 7/10 severity, worsened by deep inspiration. He denies cough, fever, or hemoptysis. He has no history of trauma. He mentions he returned from a business trip to Japan 2 days ago.',
        pmh: 'Hypertension (managed with Amlodipine).\nHyperlipidemia (Atorvastatin).\nArthroscopy of left knee 4 weeks ago.',
        medications: 'Amlodipine 5mg OD\nAtorvastatin 20mg OD',
        allergies: 'Penicillin (Rash)',
        socialHistory: 'Non-smoker. Drinks 2-3 units of alcohol per week. Lives with wife.',
        familyHistory: 'Father died of MI at 65.',
        reviewOfSystems: 'Nil else significant. No leg pain reported initially.'
    },
    examination: {
        generalAppearance: 'Patient appears anxious and tachypneic. Speaking in short sentences. Mildly diaphoresis.',
        vitals: {
            hr: 110,
            bp: '135/85',
            rr: 24,
            spo2: 89, // Room air
            temp: 37.1
        },
        findings: [
            { system: 'Respiratory', finding: 'Trachea central. Expansion equal but reduced due to pain. Percussion resonant. Auscultation: Clear vesicular breath sounds bilaterally. No wheeze or crackles.', isAbnormal: false },
            { system: 'Cardiovascular', finding: 'Tachycardic (110 bpm). Regular rhythm. Normal S1/S2. No murmurs. JVP not elevated.', isAbnormal: true },
            { system: 'Extremities', finding: 'Left calf is swollen (3cm larger than right) and tender on palpation. No erythema.', isAbnormal: true }
        ]
    },
    investigations: {
        bedside: [
            { name: 'ECG', result: 'Sinus Tachycardia @ 112bpm. S1Q3T3 pattern visible (deep S in I, Q wave in III, inverted T in III).', abnormal: true },
            { name: 'ABG', result: 'pH 7.48, pCO2 30 mmHg, pO2 58 mmHg, HCO3 24. Type 1 Respiratory Failure with Respiratory Alkalosis.', abnormal: true }
        ],
        confirmatory: [
            { name: 'D-Dimer', result: 'Elevated (1800 ng/mL)', abnormal: true, normalRange: '< 500 ng/mL' },
            { name: 'CXR', result: 'Normal cardiac size. Clear lung fields. No pneumothorax.', abnormal: false },
            { name: 'CTPA (CT Pulmonary Angiogram)', result: 'Filling defect seen in the right main pulmonary artery extending into lower lobe segmental arteries, consistent with Pulmonary Embolism.', abnormal: true }
        ]
    },
    management: {
        diagnosis: 'Acute Pulmonary Embolism (PE)',
        steps: [
            { action: 'Administer High-flow Oxygen', category: 'Immediate', explanation: 'Target sat > 94%.' },
            { action: 'Start Anticoagulation', category: 'Immediate', explanation: 'LMWH (Enoxaparin) 1mg/kg BD or UFH if unstable within view of thrombolysis.' },
            { action: 'Analgesia', category: 'Immediate', explanation: 'For pleuritic pain.' },
            { action: 'Admit to Medical Ward', category: 'Short-term', explanation: 'For monitoring and bridging to oral anticoagulants (e.g. Apixaban/Warfarin).' }
        ]
    },
    markingScheme: {
        checklist: [
            { domain: 'History', item: 'Identified long haul flight risk factor', weight: 1 },
            { domain: 'History', item: 'Identified recent surgery risk factor', weight: 1 },
            { domain: 'Examination', item: 'Checked vitals (noted hypoxia/tachycardia)', weight: 1 },
            { domain: 'Examination', item: 'Examined legs (found DVT signs)', weight: 2 },
            { domain: 'Investigations', item: 'Ordered CTPA', weight: 3 },
            { domain: 'Management', item: 'Started Anticoagulation immediately', weight: 3 }
        ],
        globalRating: 10
    }
};

const run = async () => {
    await connectDB();
    console.log('Connected to DB');

    try {
        await Case.deleteMany({ 'metadata.title': peCase.metadata.title }); // Clean up old
        const created = await Case.create(peCase as any);
        console.log('Seed Success! Created case:', created.metadata.title);
        console.log('ID:', created._id);
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
