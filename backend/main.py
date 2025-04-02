from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from function import *

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allow frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

@app.post("/backend2frontend")
async def upload_file(file: UploadFile = File(...)):
    """Handle file upload and return transcribed text."""
    audio_bytes = await file.read()
    transcription = process_audio(audio_bytes)
    print(transcription)
    return {"transcription": transcription}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)