import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { WellnessTip } from '../types';
import { useWellness } from '../contexts/WellnessContext';

interface TipCardProps {
  tip: WellnessTip;
  index: number;
}

const TipCard: React.FC<TipCardProps> = ({ tip, index }) => {
  const { selectTip, toggleSaveTip } = useWellness();

  const gradientPairs = [
    { from: 'from-blue-400', to: 'to-blue-600', glow: 'group-hover:shadow-blue-200' },
    { from: 'from-purple-400', to: 'to-purple-600', glow: 'group-hover:shadow-purple-200' },
    { from: 'from-green-400', to: 'to-green-600', glow: 'group-hover:shadow-green-200' },
    { from: 'from-pink-400', to: 'to-pink-600', glow: 'group-hover:shadow-pink-200' },
    { from: 'from-indigo-400', to: 'to-indigo-600', glow: 'group-hover:shadow-indigo-200' },
    { from: 'from-orange-400', to: 'to-orange-600', glow: 'group-hover:shadow-orange-200' },
  ];

  const gradient = gradientPairs[index % gradientPairs.length];

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaveTip(tip);
  };

  const difficultyColors = {
    easy: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    hard: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="group cursor-pointer h-full"
      onClick={() => selectTip(tip)}
    >
      <div className={`relative h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden ${gradient.glow}`}>
        {/* Animated Background Gradient */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${gradient.from} ${gradient.to} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
          initial={false}
        />

        {/* Sparkle Effect on Hover */}
        <motion.div
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="w-5 h-5 text-yellow-400" />
        </motion.div>

        {/* Top Gradient Bar */}
        <div className={`h-2 bg-gradient-to-r ${gradient.from} ${gradient.to}`} />
        
        <div className="p-6 relative">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3 flex-1">
              {/* Icon with Animation */}
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="text-5xl flex-shrink-0"
              >
                {tip.icon}
              </motion.div>
              
              <div className="flex-1 min-w-0">
                {/* Category Badge */}
                <span className="inline-block px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full mb-2">
                  {tip.category.replace('-', ' ').toUpperCase()}
                </span>
                
                {/* Time Badge */}
                {tip.timeRequired && (
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{tip.timeRequired}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Save Button with Heart Animation */}
            <motion.button
              onClick={handleSaveClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-2.5 rounded-full transition-all flex-shrink-0 ${
                tip.isSaved
                  ? 'bg-red-100 text-red-500 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-500'
              }`}
            >
              <motion.div
                animate={tip.isSaved ? {
                  scale: [1, 1.3, 1],
                } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart className={`w-5 h-5 ${tip.isSaved ? 'fill-current' : ''}`} />
              </motion.div>
            </motion.button>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 transition-all">
            {tip.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {tip.shortDescription}
          </p>

          {/* Footer Section */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {/* Difficulty Badge */}
            {tip.difficulty && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                  difficultyColors[tip.difficulty]
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                {tip.difficulty.charAt(0).toUpperCase() + tip.difficulty.slice(1)}
              </motion.span>
            )}

            {/* Learn More Button */}
            <div className="flex items-center text-purple-600 font-medium text-sm group-hover:text-blue-600 transition-colors ml-auto">
              <span>Learn More</span>
              <motion.div
                animate={{
                  x: [0, 5, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <ArrowRight className="w-4 h-4 ml-1" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Hover Overlay Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          initial={false}
        />
      </div>
    </motion.div>
  );
};

export default TipCard;