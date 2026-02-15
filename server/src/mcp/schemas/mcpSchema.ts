export interface McpStageConfig {
    stage: string;
    allowedFields: string[];
    forbiddenFields: string[];
    allowedTools: string[];
}

export const STAGE_CONFIGS: Record<string, McpStageConfig> = {
    'History': {
        stage: 'History',
        allowedFields: ['chiefComplaint', 'hpi', 'medications', 'allergies', 'socialHistory', 'familyHistory', 'reviewOfSystems'],
        forbiddenFields: ['diagnosis', 'investigations', 'management', 'markingScheme'],
        allowedTools: ['reveal_info', 'deny_request', 'progress_stage'] // 'reveal_info' covers symptoms/hpi
    },
    'Examination': {
        stage: 'Examination',
        allowedFields: ['generalAppearance', 'vitals', 'findings'],
        forbiddenFields: ['diagnosis', 'investigations', 'management'],
        allowedTools: ['reveal_finding', 'deny_request', 'progress_stage']
    },
    'Investigations': {
        stage: 'Investigations',
        allowedFields: ['bedside', 'confirmatory'],
        forbiddenFields: ['diagnosis', 'management'],
        allowedTools: ['reveal_result', 'deny_request', 'progress_stage']
    },
    'Management': {
        stage: 'Management',
        allowedFields: ['steps', 'diagnosis'], // Diagnosis allowed here
        forbiddenFields: [],
        allowedTools: ['confirm_management', 'progress_stage']
    }
};

export interface McpResponse {
    content: string | null; // Text response (if allowed, e.g. "Sure, here is...")
    tool_calls?: {
        name: string;
        arguments: any;
    }[];
}
