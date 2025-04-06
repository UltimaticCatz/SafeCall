import speech_recognition as sr
from io import BytesIO
import random
import string

def process_audio(audio_bytes: bytes) -> str:
    """Convert audio bytes to text using speech recognition."""
    try:
        recognizer = sr.Recognizer()
        audio_file = BytesIO(audio_bytes)
        with sr.AudioFile(audio_file) as source:
            audio_data = recognizer.record(source)
            return recognizer.recognize_google(audio_data, language="th-TH")
    except Exception as e:
        return str(e)

def summarize_text(text: str) -> str:
    return text

def generate_random_code(length = 8):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choices(characters, k = length))