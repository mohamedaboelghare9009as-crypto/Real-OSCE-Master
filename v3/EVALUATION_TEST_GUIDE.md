# Evaluation System Test Guide

## Quick Test Steps

### 1. Start the Backend (Port 3005)
```bash
cd v3/backend
npm run dev
```

### 2. Test Evaluation via API

#### Test 1: Check Health
```bash
curl http://localhost:3005/health
```
Expected: `{"status":"Clinical Vibe: Active",...}`

#### Test 2: Test Evaluation Endpoint
```bash
curl -X POST http://localhost:3005/api/test-evaluation \
  -H "Content-Type: application/json" \
  -d '{
    "caseId": "test-case",
    "transcript": [
      {"role": "user", "text": "Hello, I am Dr. Smith"},
      {"role": "model", "text": "I have chest pain"}
    ],
    "examinationsPerformed": ["Cardiovascular"],
    "investigationsOrdered": ["ECG"]
  }'
```

Expected: JSON response with evaluation scores

#### Test 3: Check Case Data
```bash
curl http://localhost:3005/api/test-case/test-case
```

### 3. Test via Frontend (Port 3002)

1. Start frontend:
```bash
cd v3/frontend
npm run dev
```

2. Open browser to `http://localhost:3002`

3. Start a session and interact with the patient

4. Click "Complete Session" or trigger evaluation

5. The evaluation report should now display with:
   - Clinical scores (History, Examination, Investigations, DDx, Management)
   - Communication scores (Empathy, Clarity, Professionalism, Active Listening)
   - Reasoning scores (Clinical Reasoning, Critical Thinking, Medical Knowledge, etc.)

## Troubleshooting

### "Evaluation not available" Error
- This should now be fixed - evaluation works in both mock and connected modes
- Check browser console for detailed error messages
- Check backend console for "[V3] Evaluation Requested" logs

### Backend Connection Issues
- Verify backend is running on port 3005
- Check `/health` endpoint responds
- Check for "[OSCE Master] Lead Architect Orchestrator running" message

### Frontend Connection Issues
- Verify frontend connects to backend via WebSocket
- Check browser console for "[SocketSession] Connecting" messages
- Ensure no CORS errors in console

## Features Now Working

✅ Evaluation in Mock Mode (no MongoDB required)
✅ Vertex AI integration with osce-ai-sim project
✅ Fallback to Gemini API if Vertex AI fails
✅ Basic evaluation if all AI providers fail
✅ Comprehensive marking scheme support
✅ Deep reasoning and non-clinical skills evaluation
✅ Real-time session state tracking
✅ Proper error handling and reporting
