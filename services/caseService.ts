import { Case } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

export const caseService = {
    async getAllCases(): Promise<Case[]> {
        const response = await fetch(`${API_URL}/api/cases`);
        if (!response.ok) {
            throw new Error('Failed to fetch cases');
        }
        const data = await response.json();

        // Backend now returns the data in the correct format effectively, 
        // but let's map just to be safe if the schema varies slightly from frontend types
        return data.map((c: any) => ({
            id: c._id || c.id, // Handle Mongo _id
            title: c.title,
            specialty: c.specialty,
            difficulty: c.difficulty,
            description: c.description,
            chiefComplaint: c.chief_complaint,
            vitals: c.vitals,
            patientAvatar: c.patient_avatar,
            systemInstruction: c.system_instruction,
            tags: c.tags || []
        }));
    },

    async getCaseById(id: string): Promise<Case | null> {
        const response = await fetch(`${API_URL}/api/cases/${id}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error('Failed to fetch case');
        }
        const data = await response.json();

        return {
            id: data._id || data.id,
            title: data.title,
            specialty: data.specialty,
            difficulty: data.difficulty,
            description: data.description,
            chiefComplaint: data.chief_complaint,
            vitals: data.vitals,
            patientAvatar: data.patient_avatar,
            systemInstruction: data.system_instruction,
            tags: data.tags || []
        };
    }
};
