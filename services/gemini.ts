
import { GoogleGenAI, Type } from "@google/genai";
import { Pet, PetStats, EvolutionData } from "../types";

// Always use the process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePetLoreAndStats = async (concept: string): Promise<{
  name: string;
  species: string;
  description: string;
  lore: string;
  stats: PetStats;
  personality: string;
  visualPrompt: string;
}> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a unique bio-engineered pet based on this concept: "${concept}". 
    Provide detailed lore, scientific species name, and a visual description for an AI image generator.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          species: { type: Type.STRING },
          description: { type: Type.STRING },
          lore: { type: Type.STRING },
          personality: { type: Type.STRING },
          visualPrompt: { type: Type.STRING, description: "A high-quality prompt for an image generator" },
          stats: {
            type: Type.OBJECT,
            properties: {
              strength: { type: Type.NUMBER },
              agility: { type: Type.NUMBER },
              intelligence: { type: Type.NUMBER },
              vitality: { type: Type.NUMBER },
            },
            required: ["strength", "agility", "intelligence", "vitality"]
          }
        },
        required: ["name", "species", "description", "lore", "stats", "visualPrompt", "personality"]
      }
    }
  });

  // Use response.text directly as a property
  return JSON.parse(response.text || '{}');
};

export const generatePetImage = async (visualPrompt: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `A high-quality, cinematic 3D render of a futuristic bio-engineered pet: ${visualPrompt}. Cyberpunk laboratory background, 8k resolution, intricate details, vibrant lighting.` }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  // Iterate through parts to find the image part as recommended
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Failed to generate image");
};

export const getPetResponse = async (pet: Pet, userMessage: string, history: {role: string, text: string}[]): Promise<string> => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are ${pet.name}, a ${pet.species}. 
      Personality: ${pet.personality}. 
      Lore: ${pet.lore}.
      Respond to your owner in a way that reflects your personality and current evolutionary stage. 
      Keep responses concise and immersive.`,
    }
  });

  const response = await chat.sendMessage({ message: userMessage });
  // Use response.text directly as a property
  return response.text || "Zzz... (Your pet seems distracted)";
};

// Fixed return type to EvolutionData instead of Partial<Pet>
export const evolvePet = async (pet: Pet, evolutionCore: string): Promise<EvolutionData> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `The pet ${pet.name} (${pet.species}) is evolving using a "${evolutionCore}" core. 
    Describe how its appearance, lore, and stats change.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          newName: { type: Type.STRING },
          newSpecies: { type: Type.STRING },
          evolutionDescription: { type: Type.STRING },
          newVisualPrompt: { type: Type.STRING },
          statBoosts: {
            type: Type.OBJECT,
            properties: {
              strength: { type: Type.NUMBER },
              agility: { type: Type.NUMBER },
              intelligence: { type: Type.NUMBER },
              vitality: { type: Type.NUMBER },
            },
            required: ["strength", "agility", "intelligence", "vitality"]
          }
        },
        required: ["newName", "newSpecies", "evolutionDescription", "newVisualPrompt", "statBoosts"]
      }
    }
  });

  // Use response.text directly as a property
  const data = JSON.parse(response.text || '{}');
  return data;
};
