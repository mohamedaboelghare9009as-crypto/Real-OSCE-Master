// Export all voice modules
export * from './mcp/schemas';
export * from './personas/profiles';
export * from './dynamicVoiceEngine';
export * from './tags/voiceTagsEngine';
export * from './voiceDecorator';
export * from './promptBuilder';

// DeepInfra Chatterbox Configuration
export {
    DEEPINFRA_VOICES,
    DeepInfraVoice,
    PatientDemographics,
    selectVoiceForPatient,
    getAdjustedParameters,
    getVoicesBySex,
    getVoicesByAgeGroup,
    getVoicesByLanguage,
    getVoiceById,
    isValidVoiceId,
    getAllVoiceIds,
    getVoiceCount,
    ENGLISH_FEMALE_VOICES,
    ENGLISH_MALE_VOICES,
    ADULT_FEMALE_VOICES,
    ADULT_MALE_VOICES,
    YOUNG_FEMALE_VOICES,
    YOUNG_MALE_VOICES,
    ELDERLY_FEMALE_VOICES,
    ELDERLY_MALE_VOICES,
} from './deepinfraChatterboxConfig';

// Patient Profile Extractor
export {
    extractPatientProfile,
    getPrimaryCondition,
    shouldUseVoiceTags,
    TTSVoiceDemographics,
    TTSVoiceProfile,
} from './patientProfileExtractor';

// Smart TTS Dispatcher
export {
    smartSynthesize,
    quickSynthesize,
    previewVoiceSelection,
    getVoiceRecommendation,
    SmartTTSOptions,
    SmartTTSResult,
} from './smartTTSDispatcher';
