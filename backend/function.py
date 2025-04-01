import speech_recognition as sr
from io import BytesIO

def process_audio(audio_bytes: bytes) -> str:
    """Convert audio bytes to text using speech recognition."""
    try:
        recognizer = sr.Recognizer()
        audio_file = BytesIO(audio_bytes)
        with sr.AudioFile(audio_file) as source:
            audio_data = recognizer.record(source)
            return recognizer.recognize_google(audio_data)
    except Exception as e:
        return str(e)