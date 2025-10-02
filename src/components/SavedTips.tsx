import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Download, Trash2 } from 'lucide-react';
import { useWellness } from '../contexts/WellnessContext';
import TipCard from './TipCard';
import storageService from '../services/storageService';

const SavedTips: React.FC = () => {
  const { savedTips, navigateTo, toggleSaveTip } = useWellness();

  const handleExport = () => {
    const dataStr = storageService.exportData();
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `wellness-tips-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all saved tips? This action cannot be undone.')) {
      savedTips.forEach(tip => toggleSaveTip(tip));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-wellness-lavender/10">
      <div className="absolute inset-0 bg-wellness-pattern opacity-5"></div>
      
      <div className="relative container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div className="mb-4 md:mb-0">
            <button
              onClick={() => navigateTo('board')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Back to Board</span>
            </button>
            
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2">
              Your Saved Tips
            </h1>
            <p className="text-gray-600">
              {savedTips.length} {savedTips.length === 1 ? 'tip' : 'tips'} saved for quick reference
            </p>
          </div>
          
          <div className="flex gap-3">
            {savedTips.length > 0 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExport}
                  className="bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Download className="w-5 h-5 text-primary-500" />
                  <span className="font-medium">Export</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClearAll}
                  className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="font-medium">Clear All</span>
                </motion.button>
              </>
            )}
          </div>
        </motion.div>

        {/* Saved Tips Grid */}
        {savedTips.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {savedTips.map((tip, index) => (
              <TipCard key={tip.id} tip={tip} index={index} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md mx-auto mt-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-primary-100 to-wellness-lavender/30 mb-4">
              <Heart className="w-10 h-10 text-primary-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              No Saved Tips Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start building your personal wellness library by saving tips that resonate with you.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigateTo('board')}
              className="bg-gradient-to-r from-primary-500 to-wellness-lavender text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
            >
              Browse Recommendations
            </motion.button>
          </motion.div>
        )}

        {/* Stats Section */}
        {savedTips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Wellness Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-500">{savedTips.length}</div>
                <div className="text-sm text-gray-600">Total Saved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-wellness-lavender">
                  {savedTips.filter(t => t.difficulty === 'easy').length}
                </div>
                <div className="text-sm text-gray-600">Easy Tips</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-wellness-coral">
                  {savedTips.filter(t => t.difficulty === 'medium').length}
                </div>
                <div className="text-sm text-gray-600">Medium Tips</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-wellness-ocean">
                  {savedTips.filter(t => t.difficulty === 'hard').length}
                </div>
                <div className="text-sm text-gray-600">Hard Tips</div>
              </div>
            </div>

            {/* Categories Distribution */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories Distribution</h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(savedTips.map(t => t.category))).map(category => {
                  const count = savedTips.filter(t => t.category === category).length;
                  return (
                    <span
                      key={category}
                      className="px-3 py-1 bg-gradient-to-r from-primary-50 to-wellness-lavender/20 text-primary-700 text-xs rounded-full font-medium"
                    >
                      {category.replace('-', ' ')} ({count})
                    </span>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SavedTips;