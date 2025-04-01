from fastapi import FastAPI, File, UploadFile
import uvicorn
from function import *

app = FastAPI()


@app.post("/backend2frontend")
async def upload_file(file: UploadFile = File(...)):
    """Handle file upload and return transcribed text."""
    audio_bytes = await file.read()
    transcription = process_audio(audio_bytes)
    return {"transcription": transcription}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)