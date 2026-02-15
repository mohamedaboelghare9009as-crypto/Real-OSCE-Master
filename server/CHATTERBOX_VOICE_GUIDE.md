# Chatterbox Turbo TTS Voice System

## Overview
This system ensures consistent voice selection for patient simulations using Chatterbox Turbo via DeepInfra's OpenAI-compatible API.

## Available Voices

### Male Voices
- **alex** - Adult male, clear and steady
- **andy** - Adult male, warm and professional  
- **benjamin** - Elderly male, deep voice (best for pain/serious conditions)
- **charles** - Middle-aged male, tense/authoritative (best for anxiety)
- **david** - Young male, energetic and friendly (best for pediatric)

### Female Voices
- **anna** - Middle-aged female, professional
- **bella** - Adult female, gentle and clear (default for adult females)
- **claire** - Young/elderly female, soft voice (best for pediatric or elderly)

## Voice Selection Logic

The system automatically selects voices based on:

1. **Patient Sex** (REQUIRED MATCH)
   - Male patients → Male voices only
   - Female patients → Female voices only

2. **Patient Age**
   - 0-12 years: Pediatric voices (david/claire)
   - 13-24 years: Young voices (david/claire)
   - 25-44 years: Adult voices (alex/bella)
   - 45-64 years: Middle-aged voices (charles/anna)
   - 65+ years: Elderly voices (benjamin/claire)

3. **Medical Conditions**
   - **Pain conditions** (chest pain, hurt, ache):
     - Male: benjamin (deep voice)
     - Female: bella
   
   - **Anxiety** (anxious, nervous, worried):
     - Male: charles (tense)
     - Female: bella
   
   - **Respiratory** (breath, asthma, wheezing):
     - Male: benjamin (works well with [gasp] tags)
     - Female: bella

4. **Emotional State**
   - Anxious → Tense/anxious voices
   - Distressed → Deep/urgent voices
   - Neutral → Standard voices

## Usage Examples

### Basic Usage
```typescript
// Automatically select voice based on demographics
const result = await ttsService.synthesizeForPatient(
    "I've been having chest pain for an hour.",
    { age: 72, sex: 'male', name: 'Mr. Thompson' },
    ['chest pain', 'shortness of breath'],
    'anxious'
);
// Will use: benjamin (72yo male with pain)
```

### With Voice Tags
```typescript
const result = await ttsService.synthesizeForPatient(
    "I can't breathe! It hurts so much!",
    { age: 60, sex: 'male' },
    ['respiratory distress'],
    'distressed',
    { insertVoiceTags: true }
);
// Auto-inserts [gasp], [cough] tags
```

### Manual Voice Override
```typescript
const result = await ttsService.synthesizeForPatient(
    "Hello doctor.",
    { age: 30, sex: 'female' },
    [],
    'neutral',
    { voiceId: 'anna' } // Force specific voice
);
```

### Direct Synthesis (for testing)
```typescript
const audio = await ttsService.synthesize(
    "Test message",
    'alex',  // voice
    1.0,     // speed
    0.0      // pitch
);
```

## Paralinguistic Tags

Chatterbox Turbo supports these tags for realism:
- `[cough]` - Coughing sound
- `[laugh]` - Laughter
- `[sigh]` - Sighing
- `[chuckle]` - Quiet laugh
- `[gasp]` - Gasping
- `[sniffle]` - Sniffling
- `[clears throat]` - Throat clearing
- `[groan]` - Groaning (pain)
- `[wheeze]` - Wheezing (respiratory)
- `[sob]` - Sobbing (crying)

## API Consistency

The system ensures voice consistency by:

1. **Validating voices** before API calls
2. **Preserving exact voice IDs** passed to synthesize()
3. **Checking sex matching** before synthesis
4. **Logging all voice selections** for debugging

### Debug Output
```
[VoiceSelection] Patient: 72yo male
[VoiceSelection] Conditions: chest pain, shortness of breath
[VoiceSelection] Selected Voice: benjamin (Benjamin)
[VoiceSelection] Voice Sex: male | Age Group: elderly
[VoiceSelection] Characteristics: deep, wise, slow, elderly
[TTS-DeepInfra] Voice: benjamin (requested: benjamin)
```

## Testing

Run the consistency test:
```bash
cd server && npx ts-node src/scripts/test_voice_consistency.ts
```

Run voice sex matching test:
```bash
cd server && npx ts-node src/scripts/test_voice_sex_matching.ts
```

Test all voices:
```typescript
await ttsService.testVoiceConsistency();
```

## Important Notes

1. **Voice IDs are CASE SENSITIVE** - Use lowercase: 'alex', 'bella', etc.

2. **Sex Matching is Enforced** - System will error-correct if wrong sex voice is selected

3. **Voice Override** - You can override auto-selection with `options.voiceId`

4. **API Method Consistency** - All methods (synthesize, synthesizeForPatient, streamAudio) use the same voice validation

5. **Paralinguistic Tags** - Inserted automatically based on conditions when `insertVoiceTags: true`

## Troubleshooting

**Issue**: Voice sounds wrong sex
- **Solution**: Check that patient demographics.sex is lowercase 'male' or 'female'
- Check console logs for `[VoiceSelection]` messages

**Issue**: Voice not changing
- **Solution**: Ensure you're passing different demographics/conditions
- Clear any cached voiceId in options

**Issue**: API errors
- **Solution**: Verify DEEPINFRA_TOKEN is set in .env
- Check that voice ID is valid (alex, bella, etc.)

## Configuration Files

- `server/src/voice/chatterboxConfig.ts` - Voice definitions and selection logic
- `server/src/services/ttsService.ts` - TTS service with consistency checks
- `server/src/voice/personas/profiles.ts` - Persona definitions
