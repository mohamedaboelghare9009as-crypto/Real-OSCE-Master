from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os

app = FastAPI(title="OSCE Master Judge Agent", description="Clinical Reasoning & Evaluation Engine")

class EvaluationRequest(BaseModel):
    session_id: str
    transcript: List[dict]  # List of {role: str, text: str}
    stage: str
    clinical_truth: dict  # The grounded truth for the case

class EvaluationResponse(BaseModel):
    score: int
    feedback: List[str]
    critical_errors: List[str]

@app.get("/")
def health_check():
    return {"status": "The Judge is presiding", "version": "3.0.0"}

@app.post("/evaluate", response_model=EvaluationResponse)
def evaluate_session(request: EvaluationRequest):
    """
    The Judge Agent analyzes the transcript against the clinical truth.
    In Vibe Coding mode, we'd use an LLM (Gemini 1.5 Pro) here to reason.
    For this skeleton, we return a mock evaluation.
    """
    print(f"[Judge] Evaluating session {request.session_id} at stage {request.stage}")
    
    # Mock Logic: Check for key phrases in transcript
    score = 0
    feedback = []
    
    student_turns = [t['text'].lower() for t in request.transcript if t['role'] == 'nurse'] # or 'student'
    
    # Heuristic: Check for greeting
    if any("hello" in t or "morning" in t for t in student_turns):
        score += 10
        feedback.append("Good rapport building.")
    else:
        feedback.append("Missed initial greeting.")
        
    return {
        "score": score,
        "feedback": feedback,
        "critical_errors": []
    }

if __name__ == "__main__":
    port = int(os.getenv("JUDGE_PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
