import { useState } from "react";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [audioSrc, setAudioSrc] = useState("");
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Call backend for TTS
  const handleTTS = async () => {
    try {
      if (!text.trim()) {
        alert("Please enter some text first!");
        return;
      }

      setIsProcessing(true);
      const response = await fetch("http://localhost:3000/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("TTS Error:", error);
        alert(`TTS Error: ${error.error}\n${error.details || ""}`);
        return;
      }

      const blob = await response.blob();
      setAudioSrc(URL.createObjectURL(blob));
    } catch (error) {
      console.error("TTS Error:", error);
      alert("Failed to generate speech. Check console for details.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Call backend for STT
  const handleSTT = async () => {
    try {
      if (!file) {
        alert("Please select an audio file first!");
        return;
      }

      setIsProcessing(true);
      console.log("Processing audio file:", file.name, file.type);

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Audio = reader.result;
          const response = await fetch("http://localhost:3000/stt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              audioData: base64Audio,
              mimeType: file.type 
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            console.error("STT Error:", error);
            alert(`STT Error: ${error.error}\n${error.details || ""}`);
            return;
          }

          const data = await response.json();
          console.log("STT Response:", data);
          
          // Extract text from different possible response formats
          const transcriptText = data?.text || 
                               data?.transcription?.text || 
                               data?.transcription || 
                               "No transcript available";
          
          setTranscript(transcriptText);
        } catch (error) {
          console.error("STT Error:", error);
          alert("Failed to transcribe audio. Check console for details.");
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("File reading error:", error);
      alert("Failed to read the audio file.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="app-container">
      <div className="app-content">
        {/* Header */}
        <div className="header">
          <h1 className="header-title">
            Voice AI Platform
          </h1>
          <p className="header-subtitle">
            Professional text-to-speech and speech-to-text services
          </p>
        </div>

        {/* TTS Card */}
        <div className="card card-tts">
          <div className="card-header">
            <h2 className="card-title">
              Text to Speech
            </h2>
            <p className="card-description">
              Convert written text into natural-sounding speech
            </p>
          </div>
          
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message here..."
            className="textarea"
          />
          
          <button
            onClick={handleTTS}
            disabled={isProcessing || !text.trim()}
            className="button button-primary"
          >
            {isProcessing ? 'Processing...' : 'Generate Speech'}
          </button>

          {audioSrc && (
            <audio
              controls
              src={audioSrc}
              className="audio-player"
            />
          )}
        </div>

        {/* STT Card */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              Speech to Text
            </h2>
            <p className="card-description">
              Transcribe audio files into accurate text
            </p>
          </div>

          <div className="file-upload">
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="file-input"
              id="audioFile"
            />
            <label htmlFor="audioFile" className="file-label">
              {file ? (
                <div>
                  <div className="file-name">
                    {file.name}
                  </div>
                  <div className="file-instruction">
                    Click to select a different file
                  </div>
                </div>
              ) : (
                <div>
                  <div className="file-placeholder-title">
                    Select Audio File
                  </div>
                  <div className="file-placeholder-subtitle">
                    Supports MP3, WAV, M4A formats
                  </div>
                </div>
              )}
            </label>
          </div>

          <button
            onClick={handleSTT}
            disabled={isProcessing || !file}
            className="button button-primary button-full-width"
          >
            {isProcessing ? 'Processing...' : 'Transcribe Audio'}
          </button>

          {transcript && (
            <div className="transcript-result">
              <h3 className="transcript-title">
                Transcription Result
              </h3>
              <p className="transcript-text">
                {transcript}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
