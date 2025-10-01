// example.mts
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import "dotenv/config";
import fs from "node:fs";

const elevenlabs = new ElevenLabsClient();

const voice = await elevenlabs.voices.ivc.create({
    name: "My Voice Clone",
    // Replace with the paths to your audio files.
    // The more files you add, the better the clone will be.
    files: [
        // fs.createReadStream("./sample-audio.mp3"), // Uncomment and provide actual audio file path
        // Add more audio files for better voice cloning quality
    ],
});

console.log(voice.voiceId);
