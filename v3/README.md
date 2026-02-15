
# OSCE Master V3 - Scaffolding

This directory contains the modernized architecture for OSCE Master ("Clinical Vibe").

## Agents & Architecture

1.  **Backend (Node.js/Express `v3/backend`)**
    *   **Nurse Agent:** Handles WebSocket connections, simulation state validation, and UI updates.
    *   **Patient Agent:** Bridges Gemini Live (Voice) to the `MultimodalWebSocketHandler`.
    *   **Guardian Agent:** Handles MongoDB change streams for zero-latency UI sync.

2.  **AI Engine (Python/FastAPI `v3/backend/ai_engine`)**
    *   **Judge Agent:** Analyzes transcripts using Gemini 1.5 Pro (via Vertex AI) for scoring and feedback.
    *   **Reasoning Core:** Handles non-real-time logic like Differential Diagnosis generation.

3.  **Frontend (Next.js 15 `v3/frontend`)**
    *   **Stylist Agent:** Implements the design tokens (`design-system.json`) using Tailwind CSS.
    *   **State:** Uses React Context/Zustand (TBD) to bind to the WebSocket `state-update` events.

## Getting Started

1.  **Backend:**
    ```bash
    cd v3/backend
    npm install
    npm run dev
    ```

2.  **Frontend:**
    ```bash
    cd v3/frontend
    npm run dev
    ```

3.  **Judge:**
    ```bash
    cd v3/backend/ai_engine
    pip install -r requirements.txt
    python main.py
    ```

## Vibe Coding Philosophy
-   **No Rigid State Machines:** The Patient and Nurse react to *Intents*, not just hard-coded steps.
-   **Multimodal First:** Voice and Text are first-class citizens.
-   **Zero Latency:** State updates push to the UI immediately via Change Streams.
