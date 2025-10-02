import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWellness } from '../contexts/WellnessContext';

const Navigation: React.FC = () => {
  const { currentScreen } = useWellness();

  const screens = [
    { id: 'profile', label: 'Profile' },
    { id: 'board', label: 'Recommendations' },
    { id: 'detail', label: 'Details' },
    { id: 'saved', label: 'Saved' },
  ];

  const currentIndex = screens.findIndex(s => s.id === currentScreen);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 md:hidden">
      <div className="flex justify-around items-center">
        {screens.map((screen, index) => (
          <div key={screen.id} className="relative">
            <AnimatePresence>
              {currentScreen === screen.id && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-primary-100 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>
            
            <div className={`relative px-3 py-2 text-xs font-medium transition-colors ${
              currentScreen === screen.id ? 'text-primary-600' : 'text-gray-500'
            }`}>
              {screen.label}
            </div>
            
            {index <= currentIndex && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 origin-left"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Navigation;