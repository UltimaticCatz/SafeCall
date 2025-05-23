import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

//helper function
function encodeWAV(samples, sampleRate = 44100) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  const length = samples.length * 2;

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM format
  view.setUint16(20, 1, true);  // Audio format
  view.setUint16(22, 1, true);  // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true);  // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(view, 36, 'data');
  view.setUint32(40, length, true);

  // write PCM samples
  const index = 44;
  let offset = 0;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(index + offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

function VoiceChat({ roomCode }) {
  const wsRef = useRef(null);
  const processorRef = useRef(null);
  const inputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const textWsRef = useRef(null);

  
  const clientIdRef = useRef(uuidv4());  // unique per user session 
  
  const [status, setStatus] = useState("Mic Off");
  const [transcription, setTranscription] = useState("");
  const [summary, setSummary] = useState("");

  // Create AudioContext and single WebSocket on mount (or when roomCode changes)
  useEffect(() => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = context;
    console.log("AudioContext created");

    wsRef.current = new WebSocket(`ws://localhost:8000/ws/${roomCode}`);
    wsRef.current.binaryType = "arraybuffer";

     // Create WebSocket for text updates
    textWsRef.current = new WebSocket(`ws://localhost:8000/ws/text/${roomCode}/${clientIdRef.current}`);
    textWsRef.current.onmessage = (event) => {  
      const { transcription, summary } = JSON.parse(event.data);
      console.log("Received transcription from ws:", transcription);
      console.log("Received summary from ws:", summary);
      setTranscription(transcription);
      setSummary(summary);
    };

    wsRef.current.onopen = () => {
      console.log("WebSocket connected");
    };

    wsRef.current.onmessage = (event) => {
      console.log("Received audio data:", event.data);
      playAudioBuffer(event.data);
    };

    wsRef.current.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        console.log("WebSocket closed on unmount");
      }
      if (context) {
        context.close();
        console.log("AudioContext closed on unmount");
      }
      textWsRef.current?.close();
    };
  }, [roomCode]);

  // Helper: Convert Float32 PCM data to Int16 ArrayBuffer
  const convertFloat32ToInt16 = (buffer) => {
    const l = buffer.length;
    const buf = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      let s = Math.max(-1, Math.min(1, buffer[i]));
      buf[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return buf.buffer;
  };

  // Helper: Convert Int16 data to Float32
  const convertInt16ToFloat32 = (int16Array) => {
    const float32 = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32[i] = int16Array[i] / 0x7FFF;
    }
    return float32;
  };

  // Playback function to play incoming audio buffers
  const playAudioBuffer = (pcmData) => {
    const context = audioContextRef.current;
    if (!context) return;
    const int16View = new Int16Array(pcmData);
    const float32Array = convertInt16ToFloat32(int16View);
    const buffer = context.createBuffer(1, float32Array.length, context.sampleRate);
    buffer.copyToChannel(float32Array, 0);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start();
    console.log("Playing received audio");
  };

  // Start mic recording, streaming and recording 10-second chunks
  const startMic = async () => {
    if (inputRef.current || processorRef.current || mediaRecorderRef.current) {
      console.warn("Mic already started");
      return;
    }
    try {
      // Get the audio stream and store it in a ref so that both MediaRecorder and ScriptProcessor use it
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const context = audioContextRef.current;

      // Set up real-time streaming using ScriptProcessorNode
      const input = context.createMediaStreamSource(stream);
      inputRef.current = input;
      const processor = context.createScriptProcessor(2048, 1, 1);
      processor.onaudioprocess = (event) => {
        const audioData = event.inputBuffer.getChannelData(0);
        const int16Array = convertFloat32ToInt16(audioData);
        console.log("Sending audio data chunk, byte length:", int16Array.byteLength);
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(int16Array);
        } else {
          console.warn("WebSocket not open, cannot send data.");
        }
      };
      processorRef.current = processor;
      input.connect(processor);
      // Optionally, connect processor to context.destination if you want to hear your own mic.
      processor.connect(context.destination);

      // Set up MediaRecorder to record 10-second chunks for processing.
      // Ensure the stream is available.
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data && event.data.size > 0) {
          console.log("10-second chunk ready, sending to backend");
          const formData = new FormData();
          formData.append("file", event.data, "chunk.wav");
          try {
            const response = await axios.post(`http://localhost:8000/backend2frontend/${clientIdRef.current}/${roomCode}`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            console.log("Processed audio:", response.data);
            console.log("Processed Summary", response.data.summary);
            //setTranscription(response.data.transcription);
            //setSummary(response.data.summary);
          } catch (error) {
            console.error("Error processing audio chunk:", error);
          }  
        }
      };
      mediaRecorderRef.current = mediaRecorder;
      // Start recording with 10-second timeslice (10000ms)
      mediaRecorder.start(10000);
      
      setStatus("Streaming");
      console.log("Mic started");
    } catch (error) {
      console.error("Error starting mic", error);
    }
  };

  // Stop only the mic recording (stop ScriptProcessorNode and MediaRecorder) while keeping the WebSocket open
  const stopMic = () => {
    setStatus("Mic Off");
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
      console.log("Processor disconnected");
    }
    if (inputRef.current) {
      inputRef.current.disconnect();
      inputRef.current = null;
      console.log("Mic input disconnected");
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      console.log("MediaRecorder stopped");
    }
    // Do not stop the WebSocket; that stays open for incoming audio.
    console.log("Mic stopped, but WebSocket remains open");
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded shadow-lg w-fit mx-auto">
      <h2 className="text-xl font-semibold">Voice Chat Status: {status}</h2>
      <div className="flex gap-4">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={startMic}
          disabled={status === "Streaming"}
        >
          Start Mic
        </button>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={stopMic}
          disabled={status === "Mic Off"}
        >
          Stop Mic
        </button>
      </div>
      {transcription && (
        <div className="mt-4">
          <h3>Transcription:</h3>
          <p>{transcription}</p>
        </div>
      )}
      {summary && (
        <div className="mt-4">
          <h3>Summary:</h3>
          <p>{summary}</p>
        </div>
      )}
      <p>Even with the mic off, you'll receive audio from others.</p>
    </div>
  );
}

export default VoiceChat;
