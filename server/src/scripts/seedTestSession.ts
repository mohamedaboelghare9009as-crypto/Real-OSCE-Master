import mongoose from 'mongoose';
import { Case } from '../models/Case';
import { connectDB } from '../config/db';
import dotenv from 'dotenv';
import path from 'path';

// Load Env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const testCase = {
    metadata: {
        title: 'Chronic Cough & Weight Loss',
        specialty: 'Respiratory',
        difficulty: 'Intermediate',
        description: 'A 58-year-old male with a 3-month history of worsening cough and unintentional weight loss.',
        tags: ['respiratory', 'oncology', 'chronic']
    },
    history: {
        chiefComplaint: 'I have been coughing for months and lost about 10kg.',
        description: 'Mr. David Miller, a 58-year-old construction worker, presents with a persistent cough and weight loss.',
        hpi: 'The cough is mostly dry but occasionally produces scant white sputum. No hemoptysis. He feels "weak" and has "no appetite". He has lost 10kg over 3 months. No night sweats or fevers.',
        pmh: 'COPD (Gold 2), Osteoarthritis.',
        medications: 'Salbutamol inhaler PRN, Tiotropium daily.',
        allergies: 'None',
        socialHistory: 'Smokes 40 pack-years (still smoking). Drinks 10 units of alcohol/week.',
        familyHistory: 'Brother had lung cancer.',
        reviewOfSystems: 'Nil else. Bowels normal.'
    },
    examination: {
        generalAppearance: 'Patient appears thin and cachectic. Clubbing is present in the fingers.',
        vitals: {
            hr: 88,
            bp: '120/75',
            rr: 18,
            spo2: 94,
            temp: 36.8
        },
        findings: [
            { system: 'Respiratory', finding: 'Reduced chest expansion on the right side. Dullness to percussion at the right apex. Reduced breath sounds and bronchial breathing at the right apex. No added sounds.', isAbnormal: true },
            { system: 'Cardiovascular', finding: 'Normal S1, S2. No murmurs.', isAbnormal: false },
            { system: 'Lymphatic', finding: 'Hard, fixed 1cm lymph node in the right supraclavicular fossa.', isAbnormal: true }
        ]
    },
    investigations: {
        bedside: [
            { name: 'Sputum Cytology', result: 'Negative for acid-fast bacilli (AFB).', abnormal: false },
            { name: 'Peak Flow', result: '350 L/min (reduced for age/height).', abnormal: true }
        ],
        confirmatory: [
            { name: 'CXR', result: '3cm irregular mass in the right upper lobe. Hilar lymphadenopathy.', abnormal: true },
            { name: 'CT Chest', result: 'Spiculated mass in the right upper lobe (3.2cm) with mediastinal lymphadenopathy. No pleural effusion.', abnormal: true },
            { name: 'Biopsy', result: 'Adenocarcinoma of the lung.', abnormal: true }
        ]
    },
    management: {
        diagnosis: 'Lung Cancer (Adenocarcinoma)',
        steps: [
            { action: 'Refer to Multidisciplinary Team (MDT)', category: 'Immediate', explanation: 'For staging and treatment planning.' },
            { action: 'Smoking Cessation Advice', category: 'Immediate', explanation: 'Essential for prognosis and treatment efficacy.' },
            { action: 'PET-CT Scan', category: 'Short-term', explanation: 'For systemic staging.' },
            { action: 'Pain Management & Palliative Care', category: 'Long-term', explanation: 'If metastatic or for symptom control.' }
        ]
    },
    markingScheme: {
        checklist: [
            { domain: 'History', item: 'Asked about smoking history', weight: 1, critical: true },
            { domain: 'History', item: 'Asked about weight loss', weight: 1 },
            { domain: 'Examination', item: 'Identified finger clubbing', weight: 2 },
            { domain: 'Examination', item: 'Found supraclavicular lymph node', weight: 3, critical: true },
            { domain: 'Investigations', item: 'Ordered CXR', weight: 2 },
            { domain: 'Management', item: 'Discussed MDT referral', weight: 2 }
        ],
        globalRating: 10
    }
};

const run = async () => {
    await connectDB();
    console.log('Connected to DB');

    try {
        // Clean up old test cases with same title
        await Case.deleteMany({ 'metadata.title': testCase.metadata.title });

        const created = await Case.create(testCase as any);
        console.log('Test Session Case Created Successfully!');
        console.log('Title:', created.metadata.title);
        console.log('ID:', created._id);

        // Also create a "Session" for this case to test session resume/vitals
        // But the controller typically handles this.

    } catch (err) {
        console.error('Error seeding test case:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from DB');
    }
};

run();
