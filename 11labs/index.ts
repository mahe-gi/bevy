import { ElevenLabsClient, play } from '@elevenlabs/elevenlabs-js';
import 'dotenv/config';


const elevenlabs = new ElevenLabsClient();

async function textToaudio(){

try{
  const audio = await elevenlabs.textToSpeech.convert('JBFqnCBsd6RMkjVDRZzb', {
  text: 'welcome to digital bevy , how are you doing today? ',
  modelId: 'eleven_multilingual_v2',
  outputFormat: 'mp3_44100_128',
});

await play(audio);
}
catch(e){
  console.log(e);
}

}


async function audioToText(){


const response = await fetch(
  "https://storage.googleapis.com/eleven-public-cdn/audio/marketing/nicole.mp3"
);
const audioBlob = new Blob([await response.arrayBuffer()], { type: "audio/mp3" });
const transcription = await elevenlabs.speechToText.convert({
  file: audioBlob,
  modelId: "scribe_v1", // Model to use, for now only "scribe_v1" is supported.
  tagAudioEvents: true, // Tag audio events like laughter, applause, etc.
  languageCode: "eng", // Language of the audio file. If set to null, the model will detect the language automatically.
  diarize: true, // Whether to annotate who is speaking
});
console.log(transcription.text);



}



async function timeStampAudiotoText() {

try{
const response = await fetch(
    "https://storage.googleapis.com/eleven-public-cdn/audio/marketing/nicole.mp3"
);
const audioBlob = new Blob([await response.arrayBuffer()], { type: "audio/mp3" });
const transcript = await elevenlabs.forcedAlignment.create({
    file: audioBlob,
    text: "With a soft and whispery American accent, I'm the ideal choice for creating ASMR content, meditative guides, or adding an intimate feel to your narrative projects."
})
console.log(transcript);
}catch(e){
  console.log(e)

}
  
}

// audioToText();

// textToaudio();

// timeStampAudiotoText();