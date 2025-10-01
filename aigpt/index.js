import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey:"AIzaSyCWOyU_5gt2kftgMrFkw6v2IwSg2-Cgb5s"
});


let text = "what is 2+ 2?";

async function main(text) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents:text,
    config: {
      thinkingConfig: {
        thinkingBudget: 0, // Disables thinking
      },
    }
  });
  console.log(response.text);
}

await main(text);