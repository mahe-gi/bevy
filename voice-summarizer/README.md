
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

