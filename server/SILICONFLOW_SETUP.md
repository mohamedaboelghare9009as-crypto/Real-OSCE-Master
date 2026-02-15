# SiliconFlow TTS Setup Guide

## Getting Your API Key

1. **Login to SiliconFlow:**
   - Go to: https://cloud.siliconflow.cn/ (or https://siliconflow.com/)
   - Login with your account

2. **Generate API Key:**
   - Navigate to the API Keys section in your dashboard
   - Click "Create New API Key"
   - Copy the key (format: `sk-...`)
   - **IMPORTANT:** Save it immediately - you won't be able to see it again

3. **Update your `.env` file:**
   ```env
   SILICON_FLOW_API_KEY=sk-your-new-key-here
   ```

## Common Issues

### 401 Unauthorized Error
- **Cause:** Expired, incorrect, or missing API key
- **Solution:** Generate a new key from the dashboard

### Model Requires Authentication
- Some models need real-name verification
- Check model documentation for requirements

### Testing Your Key
Run: `npx ts-node src/scripts/test_silicon.ts`

## Current Status
Your current key starts with: `sk-jovb...`
This key is returning 401, which means it's likely expired or invalid.
