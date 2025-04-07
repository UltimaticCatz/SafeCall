import speech_recognition as sr
from io import BytesIO
import wave
import io

def process_audio(audio_bytes: bytes) -> str:
    """Convert audio bytes to text using speech recognition."""
    try:
        recognizer = sr.Recognizer()
        audio_file = BytesIO(audio_bytes)
        with sr.AudioFile(audio_file) as source:
            audio_data = recognizer.record(source)
            return recognizer.recognize_google(audio_data, language="th")
    except Exception as e:
        return str(e)
    
def raw_pcm_to_wav_bytes(raw_pcm_data: bytes, sample_rate=44100, sample_width=2, channels=1) -> bytes:
    """
    Convert raw PCM bytes to WAV format and return as bytes.
    """
    wav_io = io.BytesIO()
    with wave.open(wav_io, 'wb') as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(sample_width)
        wf.setframerate(sample_rate)
        wf.writeframes(raw_pcm_data)
    
    wav_io.seek(0)  # Move to beginning for reading
    return wav_io.read()