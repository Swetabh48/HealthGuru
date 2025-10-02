export interface UserProfile {
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  goals: WellnessGoal[];
  name?: string;
}

export type WellnessGoal = 
  | 'weight-loss'
  | 'muscle-gain'
  | 'better-sleep'
  | 'stress-management'
  | 'healthy-eating'
  | 'mental-health'
  | 'energy-boost'
  | 'flexibility'
  | 'cardiovascular'
  | 'mindfulness';

export interface WellnessTip {
  id: string;
  title: string;
  shortDescription: string;
  longDescription?: string;
  category: WellnessGoal;
  icon: string;
  steps?: string[];
  benefits?: string[];
  timeRequired?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  createdAt: Date;
  isSaved?: boolean;
}

export interface AppState {
  currentScreen: 'profile' | 'board' | 'detail' | 'saved';
  userProfile: UserProfile | null;
  recommendations: WellnessTip[];
  savedTips: WellnessTip[];
  selectedTip: WellnessTip | null;
  isLoading: boolean;
  error: string | null;
}

export interface AIPromptConfig {
  model: string;
  temperature: number;
  maxTokens: number;
}

export const WELLNESS_ICONS: Record<WellnessGoal, string> = {
  'weight-loss': '⚖️',
  'muscle-gain': '💪',
  'better-sleep': '😴',
  'stress-management': '🧘',
  'healthy-eating': '🥗',
  'mental-health': '🧠',
  'energy-boost': '⚡',
  'flexibility': '🤸',
  'cardiovascular': '❤️',
  'mindfulness': '🌸'
};

export const GOAL_LABELS: Record<WellnessGoal, string> = {
  'weight-loss': 'Weight Loss',
  'muscle-gain': 'Muscle Gain',
  'better-sleep': 'Better Sleep',
  'stress-management': 'Stress Management',
  'healthy-eating': 'Healthy Eating',
  'mental-health': 'Mental Health',
  'energy-boost': 'Energy Boost',
  'flexibility': 'Flexibility',
  'cardiovascular': 'Cardiovascular Health',
  'mindfulness': 'Mindfulness'
};