import { useState } from "react";

function App() {
  const [text, setText] = useState("");
  const [audioSrc, setAudioSrc] = useState("");
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState("");

  // Call backend for TTS
  const handleTTS = async () => {
    try {
      if (!text.trim()) {
        alert("Please enter some text first!");
        return;
      }

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
    }
  };

  // Call backend for STT
  const handleSTT = async () => {
    try {
      if (!file) {
        alert("Please select an audio file first!");
        return;
      }

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
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("File reading error:", error);
      alert("Failed to read the audio file.");
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f5f5f5', 
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ 
        fontSize: '2.5rem', 
        fontWeight: 'bold', 
        marginBottom: '30px',
        color: '#333'
      }}>
        AI Audio Playground 🎙️
      </h1>

      {/* TTS Section */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
        width: '100%', 
        maxWidth: '400px', 
        marginBottom: '30px'
      }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          marginBottom: '15px',
          color: '#555'
        }}>
          Text to Speech
        </h2>
        <textarea
          style={{ 
            width: '100%', 
            border: '1px solid #ddd', 
            borderRadius: '6px', 
            padding: '10px', 
            marginBottom: '15px',
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'vertical',
            minHeight: '80px'
          }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text here..."
        />
        <button
          onClick={handleTTS}
          style={{ 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            padding: '10px 20px', 
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Generate Speech
        </button>
        {audioSrc && (
          <audio 
            controls 
            src={audioSrc} 
            style={{ marginTop: '15px', width: '100%' }}
          />
        )}
      </div>

      {/* STT Section */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
        width: '100%', 
        maxWidth: '400px'
      }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          marginBottom: '15px',
          color: '#555'
        }}>
          Speech to Text
        </h2>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ marginBottom: '15px', fontSize: '14px' }}
        />
        <button
          onClick={handleSTT}
          style={{ 
            backgroundColor: '#10b981', 
            color: 'white', 
            padding: '10px 20px', 
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Transcribe Audio
        </button>
        {transcript && (
          <p style={{ 
            marginTop: '15px', 
            padding: '15px', 
            border: '1px solid #e5e5e5', 
            borderRadius: '6px', 
            backgroundColor: '#f9f9f9',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            {transcript}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
