# Voice Summarizer App 🎙️

A fully functional AI-powered voice application with Text-to-Speech (TTS) and Speech-to-Text (STT) capabilities using the official ElevenLabs API.

## ✅ Current Status: **FIXED & WORKING**

## Features

- **Text to Speech**: Convert any text to high-quality audio
- **Speech to Text**: Transcribe audio files to text
- Clean and modern React frontend
- Express.js backend with ElevenLabs integration

## Quick Start

### Prerequisites
- Node.js installed
- ElevenLabs API key (already configured in `.env`)

### Option 1: Auto Start (Recommended)
```bash
./start.sh
```

### Option 2: Manual Start
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## Usage

1. **Text to Speech**: 
   - Enter text in the textarea
   - Click "Generate Speech"
   - Play the generated audio

2. **Speech to Text**:
   - Upload an audio file
   - Click "Transcribe Audio" 
   - View the transcription

## API Endpoints

- `POST /tts` - Text to Speech conversion
- `POST /stt` - Speech to Text transcription

## Environment Variables

The app uses these environment variables (already configured):
- `ELEVENLABS_API_KEY` - Your ElevenLabs API key
- `PORT` - Backend server port (default: 3000)

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Express.js, ElevenLabs API
- **Tools**: Node.js, npm

## Troubleshooting

If you encounter issues:
1. Ensure both frontend and backend are running
2. Check that the ElevenLabs API key is valid
3. Make sure ports 3000 (backend) and 5173 (frontend) are available