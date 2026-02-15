
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Case } from '../models/Case';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const v2TestCase = {
    "case_metadata": {
        "case_id": "test-session-case",
        "title": "Persistent Low Mood (V2 Test)",
        "specialty": "Psychiatry",
        "difficulty": "Medium",
        "expected_duration_minutes": 10,
        "innovation_element": "V2 Schema Verified",
        "learning_objectives": [
            "Test V2 Pipeline"
        ]
    },
    "scenario": {
        "station_type": "History",
        "candidate_instructions": "You are a psychiatrist. Patient is Alex. Assess low mood.",
        "osce_stages": ["history", "management"]
    },
    "truth": {
        "demographics": { "age": 28, "sex": "Male", "occupation": "Accountant" },
        "final_diagnosis": "Major Depressive Disorder",
        "history": {
            "chief_complaint": "Feeling empty and tired all the time",
            "onset": "Gradual over 3 months",
            "duration": "3 months",
            "associated_symptoms": ["anhedonia", "early morning awakening", "weight loss"],
            "risk_factors": ["work stress", "breakup"]
        },
        "mental_state_exam": {
            "mood": "Depressed",
            "insight": "Good"
        },
        "investigations": { "bedside": {}, "confirmatory": {} }
    },
    "marking_scheme": { "checklist": [] }
};

const seed = async () => {
    try {
        await connectDB();

        // Upsert by case_id AND _id (if we can force it, but _id is usually auto). 
        // We'll trust case_metadata.case_id for lookup if the service supports it.
        // Actually caseService uses `title` in verify? No, `caseId` param.
        // If frontend requests `cases/test-session-case`, the backend `getCaseById` usually expects an ObjectId.
        // BUT my map logic in `caseService` (Step 75) does `Case.findById(caseId)`.
        // So `test-session-case` MUST be the _id.
        // MongoDB _ids are usually ObjectIds (24 hex). 'test-session-case' is not.
        // Unless I use `_id: 'test-session-case'` in the schema.

        // Strategy: Force _id to be 'test-session-case' if Mongoose allows string _id.
        // Case Schema default _id is ObjectId.
        // I'll try to insert with `_id` set. If it fails, I rely on `case_metadata.case_id`.

        // Frontend calls `/cases/${caseId}`.
        // `caseController.getCaseById` -> `caseEngineService.getCaseWithSession` -> `caseService.getCaseById`.
        // `caseService.getCaseById` calls `Case.findById`.

        // FIX: I will try to overwrite the _id.

        await Case.deleteOne({ _id: 'test-session-case' }); // Cleanup if exists

        const doc = new Case({
            _id: 'test-session-case', // Force String ID
            ...v2TestCase
        });

        await doc.save();

        console.log("Seeding 'test-session-case' Successful!");
        process.exit(0);
    } catch (err) {
        console.error("Seeding Failed:", err);
        process.exit(1);
    }
};

seed();
