import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import FormData from "form-data";
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ElevenLabs API key (use env variable for safety)
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Initialize ElevenLabs client
const elevenlabs = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY
});

// ---- Health Check Endpoint ----
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!ELEVENLABS_API_KEY,
    sdkVersion: "2.17.0"
  });
});

// ---- Debug STT Parameters Endpoint ----
app.post("/debug-stt", async (req, res) => {
  try {
    const { audioData, mimeType } = req.body;
    
    if (!audioData) {
      return res.status(400).json({ error: "Audio data required for debug" });
    }

    const audioBuffer = Buffer.from(audioData.split(',')[1], 'base64');
    const audioBlob = new Blob([audioBuffer], { type: mimeType || "audio/mp3" });

    const debugInfo = {
      audioSize: audioBuffer.length,
      blobSize: audioBlob.size,
      blobType: audioBlob.type,
      mimeType: mimeType,
      apiKey: ELEVENLABS_API_KEY ? "configured" : "missing"
    };

    res.json(debugInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---- TTS Endpoint ----
app.post("/tts", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    console.log("TTS Request:", { text: text.substring(0, 100) + "..." });

    try {
      // Try with the official SDK first
      const audio = await elevenlabs.textToSpeech.convert('JBFqnCBsd6RMkjVDRZzb', {
        text: text,
        model_id: 'eleven_multilingual_v2',
        output_format: 'mp3_44100_128',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      });

      // Convert the audio stream to buffer
      const chunks = [];
      for await (const chunk of audio) {
        chunks.push(chunk);
      }
      const audioBuffer = Buffer.concat(chunks);

      res.set("Content-Type", "audio/mpeg");
      res.send(audioBuffer);
      
    } catch (sdkError) {
      console.log("SDK failed, trying direct API call:", sdkError.message);
      
      // Fallback to direct API call
      const response = await fetch(
        "https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2",
            output_format: "mp3_44100_128",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ElevenLabs API Error:", response.status, errorText);
        return res.status(response.status).json({ 
          error: "TTS API error", 
          details: errorText,
          status: response.status 
        });
      }

      const arrayBuffer = await response.arrayBuffer();
      res.set("Content-Type", "audio/mpeg");
      res.send(Buffer.from(arrayBuffer));
    }
    
  } catch (error) {
    console.error("TTS Error:", error);
    res.status(500).json({ error: "TTS failed", details: error.message });
  }
});

// ---- STT Endpoint ----
app.post("/stt", async (req, res) => {
  try {
    const { audioData, mimeType } = req.body; // frontend sends base64 audio data

    if (!audioData) {
      return res.status(400).json({ error: "Audio data is required" });
    }

    console.log("STT Request received, processing audio...");

    try {
      // Convert base64 to buffer and create blob
      const audioBuffer = Buffer.from(audioData.split(',')[1], 'base64');
      const audioBlob = new Blob([audioBuffer], { type: mimeType || "audio/mp3" });

      console.log("Audio blob created:", audioBlob.size, "bytes, type:", audioBlob.type);

      // Use the official SDK for speech-to-text - simplified approach
      console.log("Attempting STT conversion with basic parameters...");
      
      const transcription = await elevenlabs.speechToText.convert({
        file: audioBlob,
        modelId: "scribe_v1"
      });

      console.log("STT Success:", transcription);
      res.json({ 
        text: transcription.text || transcription,
        transcription: transcription 
      });

    } catch (sdkError) {
      console.log("SDK failed, trying direct API call:", sdkError.message);
      
      // Fallback to direct API call if SDK fails
      const formData = new FormData();
      const audioBuffer = Buffer.from(audioData.split(',')[1], 'base64');
      
      formData.append('file', audioBuffer, {
        filename: 'audio.mp3',
        contentType: mimeType || 'audio/mp3',
      });
      formData.append('model_id', 'scribe_v1');
      formData.append('language_code', 'eng');

      const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          ...formData.getHeaders(),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ElevenLabs STT API Error:", response.status, errorText);
        return res.status(response.status).json({ 
          error: "STT API error", 
          details: errorText,
          status: response.status 
        });
      }

      const data = await response.json();
      res.json(data);
    }

  } catch (error) {
    console.error("STT Error:", error);
    res.status(500).json({ error: "STT failed", details: error.message });
  }
});

// ---- STT File Upload Endpoint ----
app.post("/stt-file", upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Audio file is required" });
    }

    console.log("STT File Upload received:", req.file.originalname, req.file.mimetype);

    try {
      // Create blob from buffer
      const audioBlob = new Blob([req.file.buffer], { type: req.file.mimetype });

      // Use the official SDK for speech-to-text
      const transcription = await elevenlabs.speechToText.convert({
        file: audioBlob,
        modelId: "scribe_v1"
      });

      console.log("STT File Success:", transcription);
      res.json({ 
        text: transcription.text || transcription,
        transcription: transcription 
      });

    } catch (sdkError) {
      console.log("SDK failed, trying direct API call:", sdkError.message);
      
      // Fallback to direct API call
      const formData = new FormData();
      formData.append('file', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });
      formData.append('model_id', 'scribe_v1');
      formData.append('language_code', 'eng');

      const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          ...formData.getHeaders(),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ElevenLabs STT API Error:", response.status, errorText);
        return res.status(response.status).json({ 
          error: "STT API error", 
          details: errorText,
          status: response.status 
        });
      }

      const data = await response.json();
      res.json(data);
    }

  } catch (error) {
    console.error("STT File Error:", error);
    res.status(500).json({ error: "STT failed", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
