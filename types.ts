
export interface PetStats {
  strength: number;
  agility: number;
  intelligence: number;
  vitality: number;
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  description: string;
  lore: string;
  imageUrl: string;
  stats: PetStats;
  dna: string; // The prompt used to generate it
  level: number;
  personality: string;
}

export interface EvolutionData {
  newName: string;
  newSpecies: string;
  evolutionDescription: string;
  newVisualPrompt: string;
  statBoosts: PetStats;
}

export interface ChatMessage {
  role: 'user' | 'pet';
  text: string;
  timestamp: number;
}

export type AppState = 'GENESIS' | 'DASHBOARD' | 'LAB' | 'LOADING';
