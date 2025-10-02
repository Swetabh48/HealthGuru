import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Clock, ArrowRight } from 'lucide-react';
import { WellnessTip } from '../types';
import { useWellness } from '../contexts/WellnessContext';

interface TipCardProps {
  tip: WellnessTip;
  index: number;
}

const TipCard: React.FC<TipCardProps> = ({ tip, index }) => {
  const { selectTip, toggleSaveTip } = useWellness();

  const cardColors = [
    'from-blue-400 to-blue-600',
    'from-purple-400 to-purple-600',
    'from-green-400 to-green-600',
    'from-pink-400 to-pink-600',
    'from-yellow-400 to-yellow-600',
  ];

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaveTip(tip);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="relative group cursor-pointer"
      onClick={() => selectTip(tip)}
    >
      <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl blur-xl"
           style={{
             backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
             '--tw-gradient-from': '#60a5fa',
             '--tw-gradient-to': '#a78bfa',
           } as React.CSSProperties}
      />
      
      <div className="relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Gradient Header */}
        <div className={`h-2 bg-gradient-to-r ${cardColors[index % cardColors.length]}`} />
        
        <div className="p-6">
          {/* Icon and Category */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="text-4xl mr-3">{tip.icon}</div>
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {tip.category.replace('-', ' ')}
                </span>
                {tip.timeRequired && (
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {tip.timeRequired}
                  </div>
                )}
              </div>
            </div>
            
            {/* Save Button */}
            <button
              onClick={handleSaveClick}
              className={`p-2 rounded-full transition-all ${
                tip.isSaved
                  ? 'bg-red-100 text-red-500 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${tip.isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {tip.title}
          </h3>

          {/* Short Description */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {tip.shortDescription}
          </p>

          {/* Difficulty Badge */}
          {tip.difficulty && (
            <div className="mb-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                tip.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                tip.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {tip.difficulty.charAt(0).toUpperCase() + tip.difficulty.slice(1)}
              </span>
            </div>
          )}

          {/* View More */}
          <div className="flex items-center text-primary-500 hover:text-primary-600 transition-colors">
            <span className="text-sm font-medium">Learn More</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TipCard;