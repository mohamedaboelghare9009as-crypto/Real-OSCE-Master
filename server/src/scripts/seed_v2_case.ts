
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Case } from '../models/Case';
import dotenv from 'dotenv';
import path from 'path';

// Load Env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const v2CaseData = {
    "case_metadata": {
        "case_id": "PS_MD_001",
        "title": "Persistent Low Mood in a Young Professional",
        "specialty": "Psychiatry",
        "difficulty": "Medium",
        "expected_duration_minutes": 10,
        "innovation_element": "DSM-5 vs ICD-11 Nuance",
        "learning_objectives": [
            "Elicit core symptoms of depression using DSM-5/ICD-11 criteria",
            "Assess suicide risk and safety",
            "Screen for manic episodes (Bipolar exclusion)",
            "Formulate a management plan including biological and psychological interventions"
        ]
    },
    "scenario": {
        "station_type": "History + Mental State Exam + Management",
        "candidate_instructions": "You are a psychiatrist in an outpatient clinic. Your patient is Alex, a 28-year-old accountant who was referred by their GP for 'low mood'. Take a focused psychiatric history, perform a relevant mental state assessment (verbal), and outline your management plan.",
        "osce_stages": [
            "history",
            "risk_assessment",
            "mental_state_exam",
            "management",
            "summary"
        ]
    },
    "truth": {
        "demographics": {
            "age": 28,
            "sex": "Male",
            "occupation": "Accountant"
        },
        "final_diagnosis": "Major Depressive Disorder, Moderate Single Episode",
        "history": {
            "chief_complaint": "Feeling empty and tired all the time",
            "onset": "Gradual over 3 months",
            "duration": "3 months",
            "associated_symptoms": [
                "anhedonia (stopped playing guitar)",
                "early morning awakening",
                "weight loss (3kg)",
                "difficulty concentrating at work",
                "feelings of worthlessness"
            ],
            "risk_factors": [
                "high work stress",
                "recent breakup (4 months ago)",
                "family history of depression (mother)"
            ]
        },
        "mental_state_exam": {
            "appearance": "Well-groomed but poor posture, downcast eyes",
            "behavior": "Psychomotor retardation, limited eye contact",
            "speech": "Monotone, low volume, increased latency",
            "mood": "Subjectively 'empty', objectively depressed",
            "affect": "Restricted, congruent with mood",
            "thought_content": "Themes of failure, no delusions",
            "perception": "No hallucinations",
            "cognition": "Intact but reports subjective poor concentration",
            "insight": "Good (aware he needs help)"
        },
        "investigations": {
            "bedside": {
                "PHQ-9": "Score 16 (Moderately Severe)",
                "Urine_drug_screen": "Negative"
            },
            "confirmatory": {
                "TSH": "Normal",
                "FBC": "Normal (rule out anemia)"
            }
        }
    },
    "ddx_map": {
        "Major Depressive Disorder": {
            "priority": "high",
            "key_clues": [
                "2+ weeks duration",
                "anhedonia",
                "depressed mood",
                "functional impairment"
            ]
        },
        "Adjustment Disorder": {
            "priority": "medium",
            "key_clues": [
                "symptoms linked to breakup",
                "BUT severity meets MDD criteria"
            ]
        },
        "Bipolar Disorder (Depressive Phase)": {
            "priority": "medium",
            "key_clues": [
                "Must rule out mania (history is negative)"
            ]
        }
    },
    "marking_scheme": {
        "history_taking": {
            "history_of_present_illness": [
                { "action": "Identifies core symptoms (Mood, Anhedonia, Energy)", "points": 3, "required": true },
                { "action": "Assesses biological symptoms (Sleep, Appetite, Libido)", "points": 2 },
                { "action": "Assesses cognitive symptoms (Concentration, Guilt, Worthlessness)", "points": 2 },
                { "action": "Screens for Mania (Bipolar exclusion)", "points": 3, "critical": true },
                { "action": "Screens for Psychosis", "points": 1 }
            ],
            "risk_assessment": [
                { "action": "Asks directly about suicidal ideation", "points": 3, "critical": true },
                { "action": "Asks about plans, intent, and protective factors", "points": 2 },
                { "action": "Checks for history of self-harm", "points": 1 }
            ],
            "personal_history": {
                "past_psychiatric": [
                    { "action": "Previous episodes", "points": 2 }
                ],
                "drug_history": [
                    { "action": "Alcohol and recreational drug use", "points": 2, "critical": true }
                ],
                "family_history": [
                    { "action": "Family history of mood disorders/suicide", "points": 2 }
                ]
            }
        },
        "mental_state_examination": {
            "general": [
                { "action": "Comments on appearance/behavior", "points": 1 },
                { "action": "Comments on speech (rate/tone/volume)", "points": 1 }
            ],
            "mood_affect": [
                { "action": "Describes mood and affect congruency", "points": 2 }
            ],
            "thought": [
                { "action": "Identifies content (hopelessness/guilt)", "points": 2 }
            ]
        },
        "investigations": {
            "bedside_investigations": [
                { "action": "Suggests thyroid function tests (organic exclusion)", "points": 2 },
                { "action": "Suggests basic bloods (FBC/B12/Folate)", "points": 1 }
            ]
        },
        "management": {
            "immediate": [
                { "action": "Safety planning (if risk present)", "points": 2 }
            ],
            "definitive": [
                { "action": "Discusses SSRI (e.g., Sertraline/Fluoxetine)", "points": 3, "linked_ddx": ["Major Depressive Disorder"] },
                { "action": "Discusses Psychotherapy (CBT)", "points": 3 },
                { "action": "Lifestyle advice (exercise, sleep hygiene)", "points": 1 }
            ],
            "communication": [
                { "action": "Explains lag time for medication effect (2-4 weeks)", "points": 2, "critical": true },
                { "action": "Worsening warning (black box)", "points": 1 }
            ]
        },
        "critical_errors": [
            {
                "action": "Fails to ask about suicide",
                "penalty": -10,
                "fail_station": true
            },
            {
                "action": "Misses screening for mania (starts antidepressant in Bipolar)",
                "penalty": -5
            }
        ]
    }
};

const seed = async () => {
    try {
        await connectDB();
        console.log("Connected to DB");

        // Upsert based on title or case_id
        const filter = { "case_metadata.case_id": v2CaseData.case_metadata.case_id };
        const update = v2CaseData;
        const result = await Case.findOneAndUpdate(filter, update, { upsert: true, new: true });

        console.log("Seeding Successful!");
        console.log("Case ID:", result._id);
        console.log("V2 Case ID:", (result as any).case_metadata.case_id);

        process.exit(0);
    } catch (err) {
        console.error("Seeding Failed:", err);
        process.exit(1);
    }
};

seed();
