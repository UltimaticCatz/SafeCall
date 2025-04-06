from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from function import *
import httpx

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
@app.post("/backend2frontend")
async def upload_file(file: UploadFile = File(...)):
    """Handle file upload and return transcribed text."""
    audio_bytes = await file.read()
    transcription = process_audio(audio_bytes)
    print(transcription)
    summary = summarize_text(transcription)
    return {
                "transcription": transcription,
                "summary": summary
            }

'''--------------Code-------------------------------'''
class CodePayload(BaseModel):
    code :str

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

'''-------------------------------------------------'''
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000  )