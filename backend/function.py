import speech_recognition as sr
from io import BytesIO
import random
import string
import os, sys
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
print(project_root)
sys.path.insert(0, project_root)
from LinguisticAnalyzer import LinguisticAnalyzer

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

def summarize_text(text: str) -> str:
    analyzer = LinguisticAnalyzer(paragraph=text)
    results = analyzer.apply_rules()
    
    print("Test results:")
    print(results)
    return results

def generate_random_code(length = 8):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choices(characters, k = length))

if __name__ == "__main__":
    summarize_text("โทรมาจากธนาคารกรุงไทย กรุณาให้ข้อมูลบัญชีของคุณทันที")