# OSCE Master V3 - System Architecture

**Version:** 3.0.0-alpha  
**Philosophy:** Vibe Coding - Intent-Based, Multimodal-First  
**Date:** 2026-01-30

---

## Executive Summary

OSCE Master V3 is a complete re-architecture of the clinical simulation platform, transitioning from a monolithic state machine to a **distributed agent system** with three autonomous components:

1. **The Nurse (Node.js/Express)** - State orchestration and WebSocket management
2. **The Patient (Gemini Live)** - Native audio simulation with affective dialog
3. **The Judge (Python/FastAPI)** - Clinical reasoning evaluation engine

---

## Core Principles

### 1. Vibe Coding Philosophy
- **No Rigid State Machines:** Agents react to *intents*, not hard-coded steps
- **Multimodal First:** Voice and text are first-class citizens
- **Zero Latency:** MongoDB Change Streams push state updates to UI immediately
- **Clarity Override:** Physiological acting never compromises information delivery

### 2. Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 15)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Patient View │  │ Nurse View   │  │ Judge Panel  │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                    WebSocket (Socket.IO)                     │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────┐
│              BACKEND (Node.js/Express)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      MultimodalWebSocketHandler                      │  │
│  │  ┌────────────┐           ┌────────────┐            │  │
│  │  │ Patient    │           │ Nurse      │            │  │
│  │  │ Intent     │           │ Intent     │            │  │
│  │  │ Handler    │           │ Handler    │            │  │
│  │  └─────┬──────┘           └─────┬──────┘            │  │
│  └────────┼──────────────────────┼─────────────────────┘  │
│           │                      │                         │
│  ┌────────▼──────────┐  ┌────────▼──────────┐            │
│  │ Gemini Live       │  │ MongoDB           │            │
│  │ Service           │  │ Change Streams    │            │
│  └───────────────────┘  └───────────────────┘            │
└─────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────┐
│           AI ENGINE (Python/FastAPI)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Judge Agent (Gemini 1.5 Pro)                        │  │
│  │  - Transcript Analysis                               │  │
│  │  - Clinical Reasoning Evaluation                     │  │
│  │  - Differential Diagnosis Generation                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Details

### The Nurse (Backend)

**Location:** `v3/backend/src/`  
**Port:** 3005  
**Responsibilities:**
- WebSocket connection management
- Session state validation
- MongoDB Change Stream orchestration
- Intent routing (Nurse vs Patient)

**Key Files:**
- `src/index.ts` - Server entry point, MongoDB connection
- `src/handlers/MultimodalWebSocketHandler.ts` - Dual-stream orchestrator
- `src/models/SimulationState.ts` - State schema

**State Management:**
- **Source of Truth:** MongoDB (with in-memory cache for active sessions)
- **Update Mechanism:** Change Streams → WebSocket emit
- **Mock Mode:** Graceful fallback if MongoDB unavailable

### The Patient (Gemini Live)

**Integration:** `server/src/services/geminiLiveService.ts`  
**Voice System:** `server/src/voice/voiceDecorator.ts`  
**Responsibilities:**
- Native audio generation (Gemini Live 2.5 Flash)
- Affective dialog (breathlessness, pain, anxiety)
- Tool-based fact retrieval from case data

**Clarity Override Layer:**
- **Voice Decorator:** Limits respiratory breaks to every 6 words (not 2)
- **AI Prompt:** Explicit instruction: "DO NOT let symptoms stop you from finishing sentences"
- **Short Message Protection:** Messages < 6 words bypass heavy fragmentation

**Acting Directions:**
```typescript
[CLARITY OVERRIDE]: Your primary goal is to provide accurate information.
DO NOT let your shortness of breath or pain stop you from finishing a sentence.

VOICE TONE: Breathless and strained, but CLEAR and INTELLIGIBLE.
PAUSES: Use short pauses for breath, but NEVER trail off into silence.
```

### The Judge (AI Engine)

**Location:** `v3/backend/ai_engine/`  
**Port:** 8000  
**Technology:** FastAPI + Gemini 1.5 Pro  
**Responsibilities:**
- Post-session transcript analysis
- Clinical reasoning scoring
- Critical error detection

**Evaluation Pipeline:**
```python
@app.post("/evaluate")
def evaluate_session(request: EvaluationRequest):
    # 1. Load transcript + clinical truth
    # 2. Send to Gemini 1.5 Pro for reasoning
    # 3. Return structured feedback
    return EvaluationResponse(score, feedback, critical_errors)
```

---

## Design System (Stylist Agent)

**Location:** `v3/design-system.json`  
**Framework:** Tailwind CSS + Next.js 15  
**Theme:** "Clinical Vibe"

### Design Tokens

```json
{
  "colors": {
    "hospital-white": "#F8FAFC",
    "sterile-blue": "#0EA5E9",
    "emergency-red": "#EF4444",
    "monitor-green": "#22C55E",
    "slate-dark": "#0F172A"
  },
  "typography": {
    "main": "Inter, system-ui, sans-serif",
    "mono": "JetBrains Mono, monospace"
  },
  "effects": {
    "glassmorphism": "bg-white/10 backdrop-blur-md border border-white/20",
    "neon-glow": "shadow-[0_0_15px_rgba(14,165,233,0.5)]"
  }
}
```

### Component Classes

- `.clinical-card` - Card container with subtle shadow
- `.clinical-btn` - Button with focus states
- `.variant-monitor` - Monospace text with green glow (for vitals)

---

## Security (Guardian Agent)

### Environment Variables

**Backend (.env):**
```
PORT=3005
MONGO_URI=mongodb://127.0.0.1:27017/osce_master_v3
GEMINI_API_KEY=<redacted>
JWT_SECRET=<redacted>
FRONTEND_URL=http://localhost:3000
```

**AI Engine (.env):**
```
JUDGE_PORT=8000
GOOGLE_API_KEY=<redacted>
MONGO_URI=mongodb://127.0.0.1:27017/osce_master_v3
```

### Best Practices
- API keys isolated by service
- MongoDB connection forced to IPv4 (127.0.0.1)
- CORS restricted to FRONTEND_URL
- Mock Mode fallback for offline development

---

## Running the System

### 1. Backend (Nurse)
```bash
cd v3/backend
npm install
npm run dev
# Runs on http://localhost:3005
```

### 2. Frontend (Stylist)
```bash
cd v3/frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

### 3. AI Engine (Judge)
```bash
cd v3/backend/ai_engine
pip install -r requirements.txt
python main.py
# Runs on http://localhost:8000
```

### Health Checks
- Backend: `http://localhost:3005/health`
- Frontend: `http://localhost:3000`
- Judge: `http://localhost:8000`

---

## Future Enhancements

### Phase 2: Advanced Authentication
- **Antigravity Auth Integration:** OAuth with Google Antigravity API
- **Multi-Account Load Balancing:** Rotate accounts on rate limits
- **Advanced Models:** Access to `gemini-3-pro-high`, `claude-opus-4-5-thinking`

### Phase 3: Real-Time Collaboration
- **Multi-Student Sessions:** Multiple students in same simulation
- **Instructor Dashboard:** Live observation and intervention
- **Recording & Playback:** Session replay with annotations

### Phase 4: AI Enhancements
- **Differential Diagnosis AI:** Real-time DDx suggestions
- **Adaptive Difficulty:** AI adjusts case complexity based on performance
- **Voice Cloning:** Custom patient voices from audio samples

---

## Known Issues

### MongoDB Connection
- **Issue:** IPv6 connection failures on Windows
- **Fix:** Force IPv4 with `127.0.0.1` instead of `localhost`
- **Fallback:** Mock Mode (in-memory state) if DB unavailable

### Voice Decorator
- **Issue:** Over-acting physiological symptoms breaks speech flow
- **Fix:** Clarity Override layer (6-word breaks, short message protection)

### Antigravity Auth Skill
- **Status:** Installation in progress
- **Dependencies:** Missing `@opencode-ai/plugin`, `proper-lockfile`, `zod`
- **Next Step:** Install peer dependencies and rebuild

---

## Architecture Decisions

### Why MongoDB Change Streams?
- **Zero Polling:** UI updates instantly when state changes
- **Scalability:** Supports multiple frontend instances
- **Audit Trail:** All state changes are logged

### Why Separate AI Engine?
- **Language Flexibility:** Python for ML/AI libraries
- **Resource Isolation:** CPU-intensive reasoning doesn't block WebSocket
- **Horizontal Scaling:** Can deploy multiple Judge instances

### Why Gemini Live?
- **Native Audio:** No TTS synthesis lag
- **Affective Prosody:** Natural emotional expression
- **Multimodal:** Handles voice + text seamlessly

---

## Glossary

- **Vibe Coding:** Intent-based programming without rigid state machines
- **Clarity Override:** Protective layer ensuring information > acting
- **Mock Mode:** In-memory fallback when external services unavailable
- **Change Streams:** MongoDB feature for real-time data observation
- **Clinical Vibe:** Design aesthetic (hospital-inspired, glassmorphism)

---

**Maintained by:** OSCE Master Lead Developer (Antigravity Agent)  
**Last Updated:** 2026-01-30
