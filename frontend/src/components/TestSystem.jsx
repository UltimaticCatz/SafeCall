import { useState } from 'react'
import axios from "axios"

function TestSystem() {
  const [file, setFile] = useState(null);
  const [transcription, setTranscription] = useState("");
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  }

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8000/backend2frontend", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(`file upload to backend, server reponse: ${response.data}`);
      setTranscription(response.data.transcription);

    }
    catch (error) {
      console.error("Upload Error", error)
    }
  }

  return (
    <>
        <div className="card">
            <input type="file" accept="audio/wav" onChange={handleFileChange}/>
            <button onClick={handleUpload}>Upload Audio</button>
            
        </div>

        {transcription && (
          <div className="mt-4 p-2 border rounded ">
            <h3 className="text-lg font-semibold">Transcription:</h3>
            <p className="text-gray-700">{transcription}</p>
          </div>
        )}
    </>
  )
}

export default TestSystem
