import express from 'express';
import { vectorStore } from '../services/vectorStoreService';
import { embeddingService } from '../services/embeddingService';

const router = express.Router();

router.post('/embed-case', async (req, res) => {
    try {
        const { caseId, caseTruth } = req.body;

        if (!caseId || !caseTruth) {
            return res.status(400).json({ error: "Missing caseId or caseTruth" });
        }

        console.log(`[EmbedService] Starting embedding for Case: ${caseId}`);

        // 1. Split caseTruth (Strict Schema) into semantic sections
        const sections: { id: string, text: string }[] = [];

        const processSection = (name: string, data: any) => {
            if (!data) return;
            // Handle arrays and objects gracefully
            let text = "";
            if (typeof data === 'string') {
                text = data;
            } else if (Array.isArray(data)) {
                text = data.join(", ");
            } else {
                text = JSON.stringify(data, null, 2);
            }

            if (!text || text === "{}") return;

            sections.push({ id: name, text: `[${name.toUpperCase()}]\n${text}` });
        };

        // Explicitly map strict schema keys to ensure controlled embedding
        const schemaKeys = [
            'case_metadata',
            'patient_identity',
            'presenting_complaint',
            'history_of_presenting_illness',
            'past_medical_history',
            'surgical_history',
            'medications',
            'allergies',
            'family_history',
            'social_history',
            'review_of_systems',
            'vital_signs',
            'physical_examination',
            'investigations',
            'red_flags',
            //'expected_student_actions', // Maybe not needed for PATIENT engine knowledge? Keep for now if student asks "What should I do?" (Unlikely). Actually, patient doesn't know this.
            // But strict requirement says "Embed case data by section". Let's embed it but maybe V2 Prompt ignores it via retrieval relevance.
            // Actually, patient shouldn't know student actions. But "diagnostic_conclusion" is "hiddenTruth".
            // Patient knows their symptoms, history, etc.
            // Let's include everything found in case_truth.json as requested ("Embed case data...").
            'expected_student_actions',
            'diagnostic_conclusion',
            'management_plan',
            'patient_behavior_rules',
            'forbidden_information'
        ];

        schemaKeys.forEach(key => {
            if (caseTruth[key]) {
                processSection(key, caseTruth[key]);
            }
        });

        // 2. Generate Embeddings
        const texts = sections.map(s => s.text);
        const embeddings = await embeddingService.getEmbeddings(texts);

        // 3. Store in Vector DB
        const documents = sections.map((section, index) => ({
            id: `${caseId}-${section.id}`,
            caseId,
            section: section.id,
            text: section.text,
            embedding: embeddings[index],
            metadata: { timestamp: Date.now() }
        }));

        await vectorStore.addDocuments(documents);

        console.log(`[EmbedService] Successfully embedded ${documents.length} chunks for Case ${caseId}`);
        res.json({ success: true, chunks: documents.length });

    } catch (error: any) {
        console.error("Embedding Error:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
