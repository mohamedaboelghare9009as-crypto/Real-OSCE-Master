
/**
 * Patient Profile Extractor
 * Extracts TTS-relevant patient data from case schema
 */

export interface TTSVoiceDemographics {
    age: number;
    sex: 'male' | 'female';
    name?: string;
}

export interface TTSVoiceProfile {
    demographics: TTSVoiceDemographics;
    conditions: string[];
    emotionalState: string;
    clinicalContext: string[];
}

/**
 * Extracts patient profile information from case data for TTS voice selection
 */
export function extractPatientProfile(caseData: any): TTSVoiceProfile {
    if (!caseData) {
        console.warn('[PatientProfile] No case data provided, using defaults');
        return {
            demographics: { age: 35, sex: 'female' },
            conditions: [],
            emotionalState: 'neutral',
            clinicalContext: []
        };
    }

    const truth = caseData.truth || {};

    console.log(`[PatientProfile] Extracting from case data:`, {
        hasTruth: !!caseData?.truth,
        hasDemographics: !!truth?.demographics,
        rawSex: truth?.demographics?.sex,
        rawAge: truth?.demographics?.age
    });

    // Extract demographics
    const demographics: TTSVoiceDemographics = {
        age: truth.demographics?.age || 35,
        sex: (truth.demographics?.sex || 'female').toLowerCase() as 'male' | 'female',
        name: truth.demographics?.name || truth.demographics?.firstName
    };
    
    console.log(`[PatientProfile] Extracted: ${demographics.age}yo ${demographics.sex}`);

    // Extract conditions from chief complaint and symptoms
    const conditions: string[] = [];
    
    if (truth.chief_complaint) {
        conditions.push(truth.chief_complaint);
    }
    
    if (truth.chiefComplaint) {
        conditions.push(truth.chiefComplaint);
    }

    // Extract from symptoms array
    if (Array.isArray(truth.symptoms)) {
        truth.symptoms.forEach((symptom: any) => {
            if (typeof symptom === 'string') {
                conditions.push(symptom);
            } else if (symptom?.description) {
                conditions.push(symptom.description);
            } else if (symptom?.name) {
                conditions.push(symptom.name);
            }
        });
    }

    // Extract from present illness history
    if (truth.history?.present_illness?.symptoms) {
        truth.history.present_illness.symptoms.forEach((s: any) => {
            if (typeof s === 'string') conditions.push(s);
            else if (s?.description) conditions.push(s.description);
        });
    }

    // Get emotional state
    const emotionalState = truth.emotional_state || 
                          truth.emotionalState || 
                          'neutral';

    // Derive clinical context for voice adaptation
    const clinicalContext: string[] = [];
    const contextText = conditions.join(' ').toLowerCase();
    const emotionText = emotionalState.toLowerCase();

    // Pain conditions
    if (contextText.includes('pain') || contextText.includes('hurt') || 
        contextText.includes('ache') || contextText.includes('discomfort')) {
        clinicalContext.push('pain');
    }

    // Respiratory conditions
    if (contextText.includes('breath') || contextText.includes('wheeze') || 
        contextText.includes('asthma') || contextText.includes('cough') ||
        contextText.includes('lung') || contextText.includes('respiratory')) {
        clinicalContext.push('respiratory');
    }

    // Cardiac conditions
    if (contextText.includes('chest') || contextText.includes('heart') ||
        contextText.includes('cardiac') || contextText.includes('pressure')) {
        clinicalContext.push('cardiac');
    }

    // Anxiety/nervous conditions
    if (contextText.includes('anxious') || contextText.includes('nervous') ||
        contextText.includes('worry') || contextText.includes('fear') ||
        contextText.includes('anxiety') || emotionText.includes('anxious') ||
        emotionText.includes('nervous')) {
        clinicalContext.push('anxiety');
    }

    // Age-based context
    if (demographics.age > 65) {
        clinicalContext.push('elderly');
    } else if (demographics.age < 18) {
        clinicalContext.push('pediatric');
    }

    // Emotional distress
    if (emotionText.includes('distress') || emotionText.includes('panic') ||
        emotionText.includes('fear')) {
        clinicalContext.push('distress');
    }

    // Sadness/grief
    if (emotionText.includes('sad') || emotionText.includes('upset') ||
        emotionText.includes('crying') || emotionText.includes('depressed')) {
        clinicalContext.push('sadness');
    }

    console.log(`[PatientProfile] Extracted profile for ${demographics.name || 'Unknown'}:`);
    console.log(`  Age: ${demographics.age}, Sex: ${demographics.sex}`);
    console.log(`  Conditions: ${conditions.join(', ') || 'None'}`);
    console.log(`  Emotional State: ${emotionalState}`);
    console.log(`  Clinical Context: ${clinicalContext.join(', ') || 'Neutral'}`);

    return {
        demographics,
        conditions,
        emotionalState,
        clinicalContext
    };
}

/**
 * Gets the primary condition for voice adaptation
 */
export function getPrimaryCondition(profile: TTSVoiceProfile): string {
    const { clinicalContext, conditions, emotionalState } = profile;
    
    // Priority order for condition selection
    if (clinicalContext.includes('respiratory') && clinicalContext.includes('distress')) {
        return 'respiratory distress';
    }
    
    if (clinicalContext.includes('cardiac') && clinicalContext.includes('pain')) {
        return 'chest pain';
    }
    
    if (clinicalContext.includes('pain')) {
        return 'pain';
    }
    
    if (clinicalContext.includes('respiratory')) {
        return 'respiratory';
    }
    
    if (clinicalContext.includes('anxiety')) {
        return 'anxiety';
    }
    
    return conditions[0] || emotionalState || 'neutral';
}

/**
 * Determines if patient should have voice tags based on context
 */
export function shouldUseVoiceTags(profile: TTSVoiceProfile, isNurse: boolean = false): boolean {
    // Never use tags for nurse
    if (isNurse) {
        return false;
    }
    
    // Always use tags for patients
    return true;
}
