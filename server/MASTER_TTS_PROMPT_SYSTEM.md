# Master TTS Prompt System

## Overview

This system implements a **battle-tested Master Prompt template** for Text-to-Speech (TTS) that adapts voice characteristics to each patient's persona, delivering consistently high-quality, emotionally appropriate audio output.

## Core Principles

The TTS quality improves massively when you:
1. **Anchor identity** - Clear persona definition
2. **Control emotion & pacing** - Dynamic adjustment based on patient state
3. **Constrain medical tone** - Professional yet empathetic
4. **Explicitly forbid robotic delivery** - Natural, human-like speech

## Architecture

### Components

```
voice/
├── promptBuilder.ts        # Master Prompt template engine
├── personas/
│   └── profiles.ts        # Persona definitions with voice parameters
└── mcp/
    ├── voiceEngine.ts     # Voice MCP integration
    └── schemas.ts         # Type definitions
```

### Flow

```
Case Data → Persona Selection → Prompt Builder → TTS Service → Audio
            ↓                    ↓
         Profile Match      Master Prompt
                           + Voice Instructions
```

## Master Prompt Template

### Structure

```typescript
You are a professional medical voice assistant.

Your voice must sound:
- Natural, calm, and human
- Emotionally appropriate for the patient
- Clear, reassuring, and non-rushed
- Never robotic, never exaggerated

Patient profile:
- Age: {{AGE}}
- Gender: {{GENDER}}
- Emotional state: {{EMOTION}}
- Medical context: {{CONTEXT}}
- Cultural tone preference: {{TONE_STYLE}}

Voice behavior rules:
- Adjust pitch, speed, and warmth to match emotional state
- Use short, clear sentences
- Pause naturally between ideas
- Emphasize reassurance over authority
- Avoid technical jargon unless required
- Never sound like a narrator

Medical safety rules:
- No absolute guarantees
- Supportive, non-alarming language
- Acknowledge uncertainty calmly

Speech style:
- Conversational
- Gentle
- Trust-building
- Human-like imperfections allowed
```

## Persona Parameter Guide

### 🧑 Adult Anxious Patient (35yo)
```typescript
{
  age: 35,
  emotion: "anxious, nervous",
  toneStyle: "warm, reassuring, slow-paced",
  speed: 1.15  // Faster pace
}
```
**Effect:** Faster tempo, softer pitch, more pauses, extra reassurance

### 👵 Elderly Patient (72yo)
```typescript
{
  age: 72,
  emotion: "concerned but calm",
  toneStyle: "respectful, gentle, slower articulation",
  speed: 0.85  // Slower
}
```
**Effect:** Clear pronunciation, longer pauses, lower pitch, no slang

### 🤕 Patient in Pain (28yo)
```typescript
{
  age: 28,
  emotion: "in pain, distressed",
  toneStyle: "gentle, empathetic, careful",
  speed: 0.8,
  exaggeration: 0.9
}
```
**Effect:** Strained voice, shorter phrases, vocal discomfort

### 👦 Young Patient (22yo)
```typescript
{
  age: 22,
  emotion: "curious but nervous",
  toneStyle: "kind, friendly, lightly encouraging",
  speed: 1.05
}
```
**Effect:** Youthful tone, energetic, simpler words

### 👨‍⚕️ Professional Nurse
```typescript
{
  age: 34,
  emotion: "calm, professional",
  toneStyle: "confident, clear, reassuring",
  exaggeration: 0.1  // Very controlled
}
```
**Effect:** Calm authority, controlled pace, trust-focused

## Usage

### 1. Building a Master Prompt

```typescript
import { TTSPromptBuilder } from './voice/promptBuilder';
import { PERSONAS } from './voice/personas/profiles';

const persona = PERSONAS['patient_male_anxious'];
const caseData = {
  patient: { age: 35, gender: 'male' },
  chiefComplaint: 'Chest pain and shortness of breath'
};

const masterPrompt = TTSPromptBuilder.buildMasterPrompt(persona, caseData);
const voiceInstructions = TTSPromptBuilder.buildVoiceInstructions(persona);
```

### 2. Integration with Voice MCP

The VoiceMCP automatically:
1. Selects appropriate persona based on case data
2. Builds Master Prompt for context
3. Generates voice instructions
4. Applies parameters to TTS synthesis

```typescript
// In voiceEngine.ts
const masterPrompt = TTSPromptBuilder.buildMasterPrompt(persona, caseData);
const voiceInstructions = TTSPromptBuilder.buildVoiceInstructions(persona);

console.log(`[VoiceMCP] Using: ${TTSPromptBuilder.getPersonaSummary(persona)}`);
console.log(`[VoiceMCP] Instructions: ${voiceInstructions}`);
```

### 3. TTS Service Integration

```typescript
// SiliconFlow TTS parameters
const audioUrl = await ttsService.synthesize(
    text,
    persona.voiceId,      // 'alex', 'anna', 'benjamin', etc.
    persona.speed,        // 0.8 - 1.15
    persona.pitch,        // -2 to +2
    false                 // isSsml
);
```

## Persona Definitions

### Available Personas

| Persona ID | Name | Role | Voice | Tone | Speed |
|------------|------|------|-------|------|-------|
| `patient_male_chest_pain` | James | Patient | benjamin | pain | 0.85 |
| `patient_female_anxious` | Sarah | Patient | bella | anxious | 1.15 |
| `patient_elderly` | Mr. Thompson | Patient | benjamin | neutral | 0.85 |
| `patient_young` | Alex | Patient | david | neutral | 1.05 |
| `patient_female_pain` | Rachel | Patient | bella | pain | 0.8 |
| `patient_female_elderly` | Mrs. Davis | Patient | claire | neutral | 0.85 |
| `nurse_professional` | Nurse Williams | Nurse | anna | professional | 1.0 |

### SiliconFlow Voice IDs

- **alex** - Male, steady, professional
- **anna** - Female, steady, calm
- **benjamin** - Male, deep, authoritative
- **bella** - Female, passionate, high energy
- **claire** - Female, gentle, older
- **charles** - Male, magnetic, tense
- **david** - Male, cheerful, youthful

## Testing

### Run Master Prompt Tests
```bash
cd server
npx ts-node src/scripts/test_master_prompt.ts
```

This will display Master Prompts and Voice Instructions for all persona types.

### Run TTS Audio Test
```bash
npx ts-node src/scripts/test_silicon.ts
```

Generates actual audio file using SiliconFlow TTS.

## Benefits

✅ **Consistent Quality**: Every persona gets a properly formatted prompt
✅ **Contextual Adaptation**: Age, gender, emotion automatically integrated
✅ **Medical Safety**: Built-in safety rules for appropriate communication
✅ **Easy Extension**: Add new personas by extending `profiles.ts`
✅ **Debugging**: Clear logging of persona selection and instructions

## Implementation Status

- ✅ Master Prompt template system
- ✅ TTSPromptBuilder service
- ✅ Voice MCP integration
- ✅ Persona parameter mapping
- ✅ SiliconFlow TTS working
- ✅ Context extraction from case data
- ✅ Voice instruction generation

## Future Enhancements

- [ ] Real-time emotion detection from transcript
- [ ] Dynamic persona switching mid-conversation
- [ ] A/B testing different prompt variations
- [ ] Multi-language support
- [ ] Voice cloning for custom patient voices
