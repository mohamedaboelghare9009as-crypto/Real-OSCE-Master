# DeepInfra Chatterbox Turbo TTS Setup Guide

## Getting Your API Key

1. **Login to DeepInfra:**
   - Go to: https://deepinfra.com/
   - Login with your account

2. **Generate API Key:**
   - Navigate to the API Tokens section in your dashboard (https://deepinfra.com/dash/api_keys)
   - Click "Create New Token"
   - Copy the key

3. **Update your `.env` file:**
   ```env
   DEEPINFRA_TOKEN=your-deepinfra-token-here
   ```

## Model Details
- **Model Slug:** `resembleai/chatterbox-turbo`
- **Base URL:** `https://api.deepinfra.com/v1/openai`

## Paralinguistic Tags
Chatterbox Turbo supports special tags to enhance realism:
- `[cough]`
- `[laugh]`
- `[sigh]`
- `[chuckle]`
- `[gasp]`

## Testing Your Key
Run: `npx ts-node src/scripts/test_chatterbox.ts`
