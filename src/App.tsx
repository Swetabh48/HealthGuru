import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useWellness, WellnessProvider } from './contexts/WellnessContext';
import ErrorBoundary from './components/ErrorBoundary';

import Navigation from './components/Navigation';
import ProfileCapture from './components/ProfileCapture';
import RecommendationBoard from './components/RecommendationBoard';
import SavedTips from './components/SavedTips';
import TipDetail from './components/TipDetail';
import LoadingSpinner from './components/LoadingSpinner';

/**
 * Main application router and shell
 * Manages screen navigation based on WellnessContext state
 */
export const App: React.FC = () => {
  const { currentScreen, userProfile, isLoading } = useWellness();

  const renderScreen = () => {
    // Force profile capture if no profile exists
    if (!userProfile && currentScreen !== 'profile') {
      return isLoading ? <LoadingSpinner key="initial-load" /> : <ProfileCapture key="profile-capture" />;
    }
    
    switch (currentScreen) {
      case 'profile':
        return <ProfileCapture key="profile" />;
      case 'board':
        return <RecommendationBoard key="board" />;
      case 'saved':
        return <SavedTips key="saved" />;
      case 'detail':
        return <TipDetail key="detail" />;
      default:
        return <RecommendationBoard key="default-board" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      {/* Header - Always visible with gradient */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🌟</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                HealthGuru
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">Your AI Wellness Companion</p>
            </div>
          </div>
          
          {/* Optional: User indicator */}
          {userProfile && (
            <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                {userProfile.name || 'User'}
              </span>
              <span className="text-xs text-gray-500">
                • {userProfile.age}
              </span>
            </div>
          )}
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="min-h-[calc(100vh-80px)] pb-20 md:pb-8">
        <AnimatePresence mode="wait">
          {renderScreen()}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation - Mobile only */}
      {userProfile && <Navigation />}
    </div>
  );
};

/**
 * Root component with providers and error boundary
 */
const Root: React.FC = () => (
  <ErrorBoundary>
    <WellnessProvider>
      <App />
    </WellnessProvider>
  </ErrorBoundary>
);

export default Root;