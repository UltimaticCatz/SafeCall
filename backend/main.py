from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from function import *
import random
import string
import httpx

from typing import Dict, List
from fastapi import WebSocket
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from ConnectionManager import ConnectionManager  # if you put it in its own file
import time
import wave
import datetime
from pathlib import Path
from pydub import AudioSegment
from tempfile import NamedTemporaryFile
import shutil
from io import BytesIO


app = FastAPI()
code_list = []

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allow frontend
    allow_credentials=True, 
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)
'''---------------- File ---------------------------'''
# @app.post("/backend2frontend")
# async def upload_file(file: UploadFile = File(...)):
#     """Handle file upload and return transcribed text."""
#     audio_bytes = await file.read()
#     wav_bytes = raw_pcm_to_wav_bytes(audio_bytes)  #converts to wav
#     transcription = process_audio(wav_bytes)
#     print(transcription)
#     return {"transcription": transcription}

@app.post("/backend2frontend")
async def backend2frontend(file: UploadFile = File(...)):
    # Read uploaded file (webm blob) into memory
    input_bytes = await file.read()
    input_buffer = BytesIO(input_bytes)

    # Convert to WAV using pydub in memory
    audio = AudioSegment.from_file(input_buffer)  # Automatically detects format (webm)
    wav_io = BytesIO()
    audio.export(wav_io, format="wav")
    wav_io.seek(0)  # Important: rewind to start before reading

    # Pass WAV bytes directly to your processing function
    transcription = process_audio(wav_io.read())


    return {"transcription": transcription}
'''--------------Code-------------------------------'''
class CodePayload(BaseModel):
    code :str

def generate_random_code(length = 8):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choices(characters, k = length))

@app.get("/generate-code")
async def generate_code():
    code = generate_random_code()
    while code in code_list:
        code = generate_random_code()
    async with httpx.AsyncClient() as client:
        response = await client.post("http://localhost:8000/receive-code", json = {'code': code})
        return {
            'generated_code' : code,
            #'api_response': response.json()
        }

# this is a path way of generate-code; mainly run on generate-code 
@app.post("/receive-code")
async def recieve_code(payload: CodePayload):
    code_list.append(payload.code)
    return {"message": "Code posted successfully", "code": payload.code}

@app.post("/code-list")
def get_code_list():
    return {"code_list": code_list}

@app.delete("/delete-code/{code}")
def delete_code(code: str):
    if code in code_list:
        code_list.remove(code)
        return {"message": f"Code {code} removed", 'remained': code_list}
    else:
        raise HTTPException(status_code=404, detail='Code not found')
    

'''-----------------Websocket------------------------'''
manager = ConnectionManager()

# Dictionary to store a file handle for each client
client_files: Dict[int, wave.Wave_write] = {}

@app.websocket("/ws/{room_code}")
async def websocket_endpoint(websocket: WebSocket, room_code: str):
    user_id = await manager.connect(room_code, websocket)
    
    # Open a WAV file for this client connection.
    # We use the id of the websocket as a unique identifier.
    filename = f"audio/audio_{room_code}_{id(websocket)}_{int(time.time())}.wav"
    wf = wave.open(filename, "wb")
    wf.setnchannels(1)      # Mono audio (adjust if necessary)
    wf.setsampwidth(2)      # 2 bytes per sample (16-bit PCM)
    wf.setframerate(44100)  # Sample rate (adjust to match client settings)
    client_files[id(websocket)] = wf
    
    print(f"[WS] Started recording for client {id(websocket)} to {filename}")

    try:
        while True:
            data = await websocket.receive_bytes()
            print(f"[WS] Received audio chunk from client {id(websocket)} of size {len(data)} bytes")
            
            # Write the received audio data into this client's WAV file
            wf.writeframes(data)
            
            # Broadcast the data to other clients in the same room if needed
            await manager.broadcast(room_code, data, sender_id=user_id)
    except WebSocketDisconnect:
        manager.disconnect(room_code, user_id)
        print(f"[WS] Client {id(websocket)} disconnected")
    finally:
        # Close the client's WAV file and remove it from our dictionary
        wf.close()
        client_files.pop(id(websocket), None)
        print(f"[WS] Closed WAV file for client {id(websocket)}")



'''-------------------------------------------------'''
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000  )