import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWellness } from '../contexts/WellnessContext';
import { User, LayoutGrid, TrendingUp, Bookmark } from 'lucide-react';

const Navigation: React.FC = () => {
  const { currentScreen, navigateTo } = useWellness();

  const screens = [
    { id: 'board', label: 'Board', icon: LayoutGrid },
    { id: 'saved', label: 'Saved', icon: Bookmark },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-2 py-2 z-50 md:hidden transition-colors duration-300">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {screens.map((screen) => {
          const Icon = screen.icon;
          const isActive = currentScreen === screen.id;
          
          return (
            <motion.button
              key={screen.id}
              onClick={() => navigateTo(screen.id as any)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all"
            >
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>
              
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0,
                }}
                className="relative z-10"
              >
                <Icon 
                  className={`w-6 h-6 transition-colors ${
                    isActive 
                      ? 'text-purple-600 dark:text-purple-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                />
              </motion.div>
              
              <motion.span
                animate={{
                  opacity: isActive ? 1 : 0.7,
                  fontWeight: isActive ? 600 : 500,
                }}
                className={`relative z-10 text-xs mt-1 transition-colors ${
                  isActive 
                    ? 'text-purple-600 dark:text-purple-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {screen.label}
              </motion.span>

              {isActive && (
                <motion.div
                  layoutId="nav-dot"
                  className="absolute -top-1 w-1 h-1 bg-purple-500 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;