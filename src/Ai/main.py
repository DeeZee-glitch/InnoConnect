from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import requests
import json
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Updated model to accept both structures.
class RequestPayload(BaseModel):
    headers: Optional[dict] = None
    payload: Optional[dict] = None
    errorText: Optional[dict] = None

OLLAMA_URL = "http://localhost:11434/api/generate"

@app.post("/api/troubleshoot")
async def troubleshoot_error(request: RequestPayload):
    try:
        # Determine error data from either 'payload' or 'errorText'
        if request.payload:
            error_data = request.payload
        elif request.errorText:
            error_data = request.errorText.get("payload", {})
        else:
            error_data = {}
        
        error_message = error_data.get("message", "Unknown error occurred")
        error_details = error_data.get("details", "").strip() or "No additional details available."
        
        full_error_text = f"{error_message}\n\nDetails: {error_details}"
        print("Extracted Full Error Text:", full_error_text)
        
        # Modified prompt to instruct the AI to output the solution as bullet pointers.
        llama_payload = {
            "model": "llama3:8b",
           "prompt": (
    f"Troubleshoot the following API failure error and provide a direct, precise, "
    f"and accurate solution formatted as bullet points (8-10 pointers). "
    f"Ensure that each bullet point starts on a new line with a newline character before it. "
    f"Output only the bullet points with no extra text:\n{full_error_text}"
),

            "stream": False
        }
        print("Payload being sent to Ollama:", json.dumps(llama_payload, indent=2))
        
        response = requests.post(
            OLLAMA_URL,
            json=llama_payload,
            headers={"Content-Type": "application/json"},
            timeout=100000
        )
        print("Ollama Response:", response.text)
        
        if response.status_code == 200:
            try:
                response_data = response.json()
                full_response = response_data.get("response", "No troubleshooting information available.")
            except json.JSONDecodeError:
                full_response = f"Received invalid response format: {response.text}"
        else:
            full_response = f"Error from AI model: {response.text}"
        
        return {"response": full_response}
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Troubleshooting failed: {str(e)}"
        )
