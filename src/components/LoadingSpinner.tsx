import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Brain, Dumbbell, Moon } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  const [currentTip, setCurrentTip] = useState(0);
  
  const loadingTips = [
    { icon: Sparkles, text: "Analyzing your wellness goals...", color: "text-purple-500" },
    { icon: Brain, text: "Creating personalized strategies...", color: "text-blue-500" },
    { icon: Heart, text: "Optimizing for your lifestyle...", color: "text-pink-500" },
    { icon: Dumbbell, text: "Crafting actionable tips...", color: "text-green-500" },
    { icon: Moon, text: "Almost ready...", color: "text-indigo-500" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % loadingTips.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [loadingTips.length]);

  const CurrentIcon = loadingTips[currentTip].icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-20 w-64 h-64 bg-purple-300 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-20 right-20 w-80 h-80 bg-blue-300 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center max-w-md px-6"
      >
        {/* Main Spinner */}
        <div className="relative mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            className="w-24 h-24 mx-auto"
          >
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-blue-500"></div>
          </motion.div>
          
          <motion.div
            animate={{ rotate: -360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 w-24 h-24 mx-auto"
          >
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-pink-500 border-l-purple-400"></div>
          </motion.div>

          {/* Center Icon */}
          <motion.div
            key={currentTip}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
              <CurrentIcon className={`w-6 h-6 ${loadingTips[currentTip].color}`} />
            </div>
          </motion.div>
        </div>

        {/* Loading Text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTip}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Generating Your Wellness Plan
            </h3>
            <p className="text-gray-600 font-medium">
              {loadingTips[currentTip].text}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-2 mb-8">
          {loadingTips.map((_, index) => (
            <motion.div
              key={index}
              animate={{
                scale: index === currentTip ? 1.5 : 1,
                opacity: index === currentTip ? 1 : 0.3,
              }}
              transition={{ duration: 0.3 }}
              className={`w-2 h-2 rounded-full ${
                index === currentTip ? 'bg-purple-500' : 'bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Animated Wave Dots */}
        <motion.div
          className="flex justify-center space-x-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {[0, 1, 2, 3].map((index) => (
            <motion.div
              key={index}
              animate={{
                y: [0, -15, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.15,
                ease: "easeInOut"
              }}
              className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
            />
          ))}
        </motion.div>

        {/* Subtle Hint Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-sm text-gray-500 italic"
        >
          Powered by AI • Personalized just for you
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;