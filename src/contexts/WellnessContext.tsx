import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, WellnessTip, AppState } from '../types';
import aiService from '../services/aiService';
import storageService from '../services/storageService';

interface ProgressEntry {
  date: Date;
  tipId: string;
  completed: boolean;
  notes?: string;
}

interface ExtendedAppState extends AppState {
  progress: ProgressEntry[];
  darkMode: boolean;
}

interface WellnessContextType extends ExtendedAppState {
  setUserProfile: (profile: UserProfile) => Promise<void>;
  generateRecommendations: () => Promise<void>;
  selectTip: (tip: WellnessTip) => Promise<void>;
  toggleSaveTip: (tip: WellnessTip) => void;
  navigateTo: (screen: ExtendedAppState['currentScreen']) => void;
  clearSession: () => void;
  regenerateRecommendations: () => Promise<void>;
  toggleDarkMode: () => void;
  addProgress: (tipId: string, completed: boolean, notes?: string) => void;
  toggleStepCompletion: (tipId: string, stepIndex: number) => void;
}

const WellnessContext = createContext<WellnessContextType | undefined>(undefined);

export const WellnessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ExtendedAppState>({
    currentScreen: 'profile' as any,
    userProfile: null,
    recommendations: [],
    savedTips: [],
    selectedTip: null,
    progress: [],
    isLoading: false,
    error: null,
    darkMode: false,
  });

  // Load saved data on mount
  useEffect(() => {
    const savedProfile = storageService.getUserProfile();
    const savedTips = storageService.getSavedTips();
    const recommendations = storageService.getRecommendations();
    const savedDarkMode = localStorage.getItem('wellness_dark_mode') === 'true';
    const savedProgress = JSON.parse(localStorage.getItem('wellness_progress') || '[]');

    setState(prev => ({
      ...prev,
      userProfile: savedProfile,
      savedTips: savedTips,
      recommendations: recommendations,
      progress: savedProgress.map((p: any) => ({ ...p, date: new Date(p.date) })),
      currentScreen: savedProfile ? ('board' as any) : ('profile' as any),
      darkMode: savedDarkMode,
    }));
  }, []);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('wellness_dark_mode', state.darkMode.toString());
  }, [state.darkMode]);

  // Save progress
  useEffect(() => {
    localStorage.setItem('wellness_progress', JSON.stringify(state.progress));
  }, [state.progress]);

  const setUserProfile = async (profile: UserProfile) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      storageService.saveUserProfile(profile);
      setState(prev => ({
        ...prev,
        userProfile: profile,
        isLoading: false,
      }));
      
      await generateRecommendations();
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to save profile',
      }));
    }
  };

  const generateRecommendations = async () => {
    if (!state.userProfile) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const tips = await aiService.generateRecommendations(state.userProfile);
      
      // Mark saved tips
      const savedIds = state.savedTips.map(t => t.id);
      const markedTips = tips.map(tip => ({
        ...tip,
        isSaved: savedIds.includes(tip.id),
      }));
      
      storageService.saveRecommendations(markedTips);
      
      setState(prev => ({
        ...prev,
        recommendations: markedTips,
        currentScreen: 'board' as any,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to generate recommendations. Please try again.',
      }));
    }
  };

  const regenerateRecommendations = async () => {
    await generateRecommendations();
  };

  const selectTip = async (tip: WellnessTip) => {
    setState(prev => ({ ...prev, isLoading: true, selectedTip: tip }));
    
    try {
      if (!tip.longDescription && state.userProfile) {
        const detailedTip = await aiService.generateDetailedExplanation(tip, state.userProfile);
        
        // Update the tip in recommendations
        const updatedRecommendations = state.recommendations.map(t =>
          t.id === detailedTip.id ? detailedTip : t
        );
        
        storageService.saveRecommendations(updatedRecommendations);
        
        setState(prev => ({
          ...prev,
          selectedTip: detailedTip,
          recommendations: updatedRecommendations,
          currentScreen: 'detail' as any,
          isLoading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          selectedTip: tip,
          currentScreen: 'detail' as any,
          isLoading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load tip details',
      }));
    }
  };

  const toggleSaveTip = (tip: WellnessTip) => {
    const isSaved = storageService.toggleSaveTip(tip);
    
    // Update saved tips list
    const savedTips = storageService.getSavedTips();
    
    // Update recommendations to reflect save status
    const updatedRecommendations = state.recommendations.map(t =>
      t.id === tip.id ? { ...t, isSaved } : t
    );
    
    storageService.saveRecommendations(updatedRecommendations);
    
    setState(prev => ({
      ...prev,
      savedTips,
      recommendations: updatedRecommendations,
      selectedTip: prev.selectedTip?.id === tip.id 
        ? { ...prev.selectedTip, isSaved }
        : prev.selectedTip,
    }));
  };

  const navigateTo = (screen: ExtendedAppState['currentScreen']) => {
    setState(prev => ({ ...prev, currentScreen: screen }));
  };

  const clearSession = () => {
    storageService.clearSession();
    setState(prev => ({
      ...prev,
      currentScreen: 'profile' as any,
      userProfile: null,
      recommendations: [],
      savedTips: storageService.getSavedTips(), // Keep saved tips
      selectedTip: null,
      isLoading: false,
      error: null,
    }));
  };

  const toggleDarkMode = () => {
    setState(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const addProgress = (tipId: string, completed: boolean, notes?: string) => {
    const newEntry: ProgressEntry = {
      date: new Date(),
      tipId,
      completed,
      notes,
    };
    setState(prev => ({
      ...prev,
      progress: [...prev.progress, newEntry],
    }));
  };

  const toggleStepCompletion = (tipId: string, stepIndex: number) => {
    setState(prev => {
      const updatedRecommendations = prev.recommendations.map(tip => {
        if (tip.id === tipId) {
          const completedSteps = tip.completedSteps || [];
          const newCompletedSteps = completedSteps.includes(stepIndex)
            ? completedSteps.filter(i => i !== stepIndex)
            : [...completedSteps, stepIndex];
          return { ...tip, completedSteps: newCompletedSteps };
        }
        return tip;
      });

      const updatedSavedTips = prev.savedTips.map(tip => {
        if (tip.id === tipId) {
          const completedSteps = tip.completedSteps || [];
          const newCompletedSteps = completedSteps.includes(stepIndex)
            ? completedSteps.filter(i => i !== stepIndex)
            : [...completedSteps, stepIndex];
          return { ...tip, completedSteps: newCompletedSteps };
        }
        return tip;
      });

      storageService.saveRecommendations(updatedRecommendations);

      return {
        ...prev,
        recommendations: updatedRecommendations,
        savedTips: updatedSavedTips,
        selectedTip: prev.selectedTip?.id === tipId
          ? {
              ...prev.selectedTip,
              completedSteps: updatedRecommendations.find(t => t.id === tipId)?.completedSteps || []
            }
          : prev.selectedTip,
      };
    });
  };

  const contextValue: WellnessContextType = {
    ...state,
    setUserProfile,
    generateRecommendations,
    selectTip,
    toggleSaveTip,
    navigateTo,
    clearSession,
    regenerateRecommendations,
    toggleDarkMode,
    addProgress,
    toggleStepCompletion,
  };

  return (
    <WellnessContext.Provider value={contextValue}>
      {children}
    </WellnessContext.Provider>
  );
};

export const useWellness = () => {
  const context = useContext(WellnessContext);
  if (!context) {
    throw new Error('useWellness must be used within a WellnessProvider');
  }
  return context;
};