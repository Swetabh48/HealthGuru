import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, WellnessTip, AppState } from '../types';
import aiService from '../services/aiService';
import storageService from '../services/storageService';

interface WellnessContextType extends AppState {
  setUserProfile: (profile: UserProfile) => Promise<void>;
  generateRecommendations: () => Promise<void>;
  selectTip: (tip: WellnessTip) => Promise<void>;
  toggleSaveTip: (tip: WellnessTip) => void;
  navigateTo: (screen: AppState['currentScreen']) => void;
  clearSession: () => void;
  regenerateRecommendations: () => Promise<void>;
}

const WellnessContext = createContext<WellnessContextType | undefined>(undefined);

export const WellnessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    currentScreen: 'profile',
    userProfile: null,
    recommendations: [],
    savedTips: [],
    selectedTip: null,
    isLoading: false,
    error: null,
  });

  // Load saved data on mount
  useEffect(() => {
    const savedProfile = storageService.getUserProfile();
    const savedTips = storageService.getSavedTips();
    const recommendations = storageService.getRecommendations();

    setState(prev => ({
      ...prev,
      userProfile: savedProfile,
      savedTips: savedTips,
      recommendations: recommendations,
      currentScreen: savedProfile ? 'board' : 'profile',
    }));
  }, []);

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
        currentScreen: 'board',
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
          currentScreen: 'detail',
          isLoading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          selectedTip: tip,
          currentScreen: 'detail',
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

  const navigateTo = (screen: AppState['currentScreen']) => {
    setState(prev => ({ ...prev, currentScreen: screen }));
  };

  const clearSession = () => {
    storageService.clearSession();
    setState({
      currentScreen: 'profile',
      userProfile: null,
      recommendations: [],
      savedTips: storageService.getSavedTips(), // Keep saved tips
      selectedTip: null,
      isLoading: false,
      error: null,
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