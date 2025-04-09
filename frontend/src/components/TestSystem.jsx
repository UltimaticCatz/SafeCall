import { useState } from 'react'
import axios from "axios"

function TestSystem() {
  const [file, setFile] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [summary, setSummary] = useState("");
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
      const response = await axios.post("http://localhost:8000/backend2frontendFile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log(`file upload to backend, server reponse: ${response.data}`);
      console.log(`Transcription: ${transcription}`);
      console.log(`Summary: ${summary}`);
      setTranscription(response.data.transcription);
      setSummary(response.data.summary);

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
            <p className="">{transcription}</p>
            <h3 className="text-lg font-semibold">Summary:</h3>
            <p className="">{summary}</p>
          </div>
        )}
    </>
  )
}

export default TestSystem
