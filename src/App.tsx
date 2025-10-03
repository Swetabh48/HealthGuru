import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useWellness, WellnessProvider } from './contexts/WellnessContext';
import ErrorBoundary from './components/ErrorBoundary';
import { Moon, Sun, Menu, X } from 'lucide-react';

import Navigation from './components/Navigation';
import ProfileCapture from './components/ProfileCapture';
import RecommendationBoard from './components/RecommendationBoard';
import SavedTips from './components/SavedTips';
import TipDetail from './components/TipDetail';
import ProgressTracker from './components/ProgressTracker';
import LoadingSpinner from './components/LoadingSpinner';

/**
 * Main application router and shell
 * Manages screen navigation based on WellnessContext state
 */
export const App: React.FC = () => {
  const { currentScreen, userProfile, isLoading, darkMode, toggleDarkMode } = useWellness();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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
      case 'progress':
        return <ProgressTracker key="progress" />;
      default:
        return <RecommendationBoard key="default-board" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans antialiased transition-colors duration-300">
      {/* Header - Always visible with gradient */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-lg border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div 
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg cursor-pointer"
            >
              <span className="text-2xl">🌟</span>
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                HealthGuru
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Your AI Wellness Companion</p>
            </div>
          </div>
          
          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {/* User indicator */}
            {userProfile && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {userProfile.name || 'User'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  • {userProfile.age}
                </span>
              </motion.div>
            )}

            {/* Dark Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all shadow-md"
              aria-label="Toggle dark mode"
            >
              <AnimatePresence mode="wait">
                {darkMode ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && userProfile && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {userProfile.name || 'User'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    • {userProfile.age} • {userProfile.gender}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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