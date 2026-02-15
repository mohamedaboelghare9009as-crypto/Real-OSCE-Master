export type VoiceTag =
    | '[cough]'
    | '[laugh]'
    | '[sigh]'
    | '[chuckle]'
    | '[gasp]'
    | '[groan]';

export interface VoiceTagConfig {
    tag: VoiceTag;
    weight: number;
    maxPerParagraph: number;
    requiresCondition: string[];
    incompatibleWith: VoiceTag[];
}

export const VOICE_TAG_CONFIGS: Record<VoiceTag, VoiceTagConfig> = {
    '[cough]': {
        tag: '[cough]',
        weight: 0.3,
        maxPerParagraph: 2,
        requiresCondition: ['respiratory', 'cold', 'flu', 'infection', 'asthma', 'bronchitis', 'pneumonia', 'cough', 'smoker', 'breath'],
        incompatibleWith: ['[laugh]', '[chuckle]']
    },
    '[laugh]': {
        tag: '[laugh]',
        weight: 0.2,
        maxPerParagraph: 1,
        requiresCondition: ['happy', 'joy', 'excited', 'nervous laugh', 'awkward', 'amusing', 'joke'],
        incompatibleWith: ['[cough]', '[gasp]']
    },
    '[sigh]': {
        tag: '[sigh]',
        weight: 0.25,
        maxPerParagraph: 2,
        requiresCondition: ['tired', 'exhausted', 'frustrated', 'relieved', 'sad', 'disappointed', 'worried', 'anxious'],
        incompatibleWith: ['[laugh]', '[gasp]']
    },
    '[chuckle]': {
        tag: '[chuckle]',
        weight: 0.2,
        maxPerParagraph: 1,
        requiresCondition: ['amused', 'nervous', 'embarrassed', 'shy', 'polite', 'humor'],
        incompatibleWith: ['[cough]']
    },
    '[gasp]': {
        tag: '[gasp]',
        weight: 0.35,
        maxPerParagraph: 1,
        requiresCondition: ['shock', 'surprise', 'fear', 'sudden', 'alarm', 'horror', 'realization', 'chest pain', 'heart attack'],
        incompatibleWith: ['[laugh]', '[sigh]', '[chuckle]']
    },
    '[groan]': {
        tag: '[groan]',
        weight: 0.4,
        maxPerParagraph: 1,
        requiresCondition: ['pain', 'discomfort', 'moving', 'getting up', 'sore', 'aching', 'back pain'],
        incompatibleWith: ['[laugh]', '[chuckle]']
    }
};

export interface TagInsertionContext {
    conditions: string[];
    emotionalState: string;
    sentencePosition: 'start' | 'middle' | 'end';
    sentenceLength: number;
    paragraphIndex: number;
    totalParagraphs: number;
    patientAge?: number;
    isElderly?: boolean;
    isChild?: boolean;
}

export class VoiceTagsEngine {
    private usedTagsInParagraph: Map<number, Set<VoiceTag>> = new Map();
    private paragraphTagCount: Map<number, number> = new Map();

    reset(): void {
        this.usedTagsInParagraph.clear();
        this.paragraphTagCount.clear();
    }

    private getApplicableTags(context: TagInsertionContext): VoiceTag[] {
        const allConditions = [
            ...context.conditions.map(c => c.toLowerCase()),
            context.emotionalState.toLowerCase()
        ];

        const applicableTags: VoiceTag[] = [];

        for (const [tag, config] of Object.entries(VOICE_TAG_CONFIGS)) {
            const matchesCondition = config.requiresCondition.some(condition =>
                allConditions.some(c => c.includes(condition) || condition.includes(c))
            );

            if (matchesCondition) {
                const paragraphTags = this.usedTagsInParagraph.get(context.paragraphIndex) || new Set();
                const paragraphCount = this.paragraphTagCount.get(context.paragraphIndex) || 0;

                if (paragraphTags.size < config.maxPerParagraph && paragraphCount < 3) {
                    const hasIncompatible = config.incompatibleWith.some(incomp =>
                        paragraphTags.has(incomp)
                    );

                    if (!hasIncompatible) {
                        applicableTags.push(tag as VoiceTag);
                    }
                }
            }
        }

        return applicableTags;
    }

    private selectBestTag(tags: VoiceTag[], context: TagInsertionContext): VoiceTag | null {
        if (tags.length === 0) return null;

        const configs = tags.map(tag => VOICE_TAG_CONFIGS[tag]);
        const totalWeight = configs.reduce((sum, config) => sum + config.weight, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < configs.length; i++) {
            random -= configs[i].weight;
            if (random <= 0) {
                return tags[i];
            }
        }

        return tags[0];
    }

    private getInsertionPosition(context: TagInsertionContext): 'before' | 'after' {
        if (context.sentencePosition === 'start') return 'after';
        if (context.sentencePosition === 'end') return 'before';
        if (context.sentenceLength > 15) return 'before';
        return Math.random() > 0.5 ? 'before' : 'after';
    }

    private shouldInsertTag(context: TagInsertionContext): boolean {
        let baseProbability = 0.25;

        // Increase probability for specific clinical contexts
        if (context.conditions.some(c => c.toLowerCase().includes('pain') || c.toLowerCase().includes('hurt'))) {
            baseProbability += 0.15; // More groans/gasps for pain
        }
        if (context.conditions.some(c => c.toLowerCase().includes('breath') || c.toLowerCase().includes('asthma'))) {
            baseProbability += 0.2; // More coughs/wheezes for respiratory issues
        }

        if (context.isElderly) {
            baseProbability += 0.1;
        }

        return Math.random() < baseProbability;
    }

    insertTags(text: string, context: TagInsertionContext): string {
        this.reset();

        // Improved sentence splitting that preserves punctuation
        const sentences = text.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+(?:\s+|$)/g) || [text];
        let result: string[] = [];
        let paragraphIndex = 0;

        for (let i = 0; i < sentences.length; i++) {
            let sentence = sentences[i].trim();
            if (!sentence) continue;

            const sentenceContext: TagInsertionContext = {
                ...context,
                sentencePosition: i === 0 ? 'start' : i === sentences.length - 1 ? 'end' : 'middle',
                sentenceLength: sentence.split(' ').length,
                paragraphIndex
            };

            const applicableTags = this.getApplicableTags(sentenceContext);

            if (applicableTags.length > 0 && this.shouldInsertTag(sentenceContext)) {
                const selectedTag = this.selectBestTag(applicableTags, sentenceContext);

                if (selectedTag) {
                    // Decide where to insert within the sentence
                    const midSentenceMatch = sentence.match(/[,;]|\.\.\.|--/);

                    if (midSentenceMatch && Math.random() > 0.4) {
                        // Insert after the first pause point (comma, ellipsis, etc)
                        const pivot = sentence.indexOf(midSentenceMatch[0]) + midSentenceMatch[0].length;
                        const firstPart = sentence.substring(0, pivot);
                        const secondPart = sentence.substring(pivot).trim();
                        sentence = `${firstPart} ${selectedTag} ${secondPart}`;
                    } else {
                        // Standard before/after insertion
                        const position = this.getInsertionPosition(sentenceContext);
                        if (position === 'before') {
                            sentence = `${selectedTag} ${sentence}`;
                        } else {
                            // If sentence ends with punctuation, insert before it or just after
                            if (sentence.match(/[.!?]$/)) {
                                sentence = sentence.replace(/([.!?])$/, ` ${selectedTag}$1`);
                            } else {
                                sentence = `${sentence} ${selectedTag}`;
                            }
                        }
                    }

                    const paragraphTags = this.usedTagsInParagraph.get(paragraphIndex) || new Set();
                    paragraphTags.add(selectedTag);
                    this.usedTagsInParagraph.set(paragraphIndex, paragraphTags);

                    const count = this.paragraphTagCount.get(paragraphIndex) || 0;
                    this.paragraphTagCount.set(paragraphIndex, count + 1);
                }
            }

            result.push(sentence);

            if (sentence.includes('.') && i < sentences.length - 1) {
                // Approximate paragraph break
                if (Math.random() > 0.7) paragraphIndex++;
            }
        }

        return result.join(' ');
    }

    insertManualTags(text: string, tags: VoiceTag[]): string {
        const splitText = text.split(' ');
        const tagCount = tags.length;

        if (splitText.length < 5 || tagCount === 0) return text;

        const positions = new Set<number>();
        while (positions.size < Math.min(tagCount, Math.floor(splitText.length / 4))) {
            positions.add(Math.floor(Math.random() * splitText.length));
        }

        const sortedPositions = Array.from(positions).sort((a, b) => a - b);

        let offset = 0;
        for (let i = 0; i < sortedPositions.length; i++) {
            const pos = sortedPositions[i] + offset;
            const tag = tags[i % tags.length];
            splitText.splice(pos, 0, tag);
            offset++;
        }

        return splitText.join(' ');
    }

    autoGenerateFromConditions(conditions: string[], baseText: string): string {
        const context: TagInsertionContext = {
            conditions,
            emotionalState: 'neutral',
            sentencePosition: 'middle',
            sentenceLength: 10,
            paragraphIndex: 0,
            totalParagraphs: 1
        };

        return this.insertTags(baseText, context);
    }
}

export const voiceTagsEngine = new VoiceTagsEngine();
