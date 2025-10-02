import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Clock, Target, CheckCircle, Share2, Copy } from 'lucide-react';
import { useWellness } from '../contexts/WellnessContext';
import LoadingSpinner from './LoadingSpinner';

const TipDetail: React.FC = () => {
  const { selectedTip, isLoading, navigateTo, toggleSaveTip } = useWellness();
  const [copiedStep, setCopiedStep] = React.useState<number | null>(null);

  if (!selectedTip) {
    return null;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const handleCopyStep = (step: string, index: number) => {
    navigator.clipboard.writeText(step);
    setCopiedStep(index);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: selectedTip.title,
      text: selectedTip.shortDescription,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-wellness-lavender/10">
      <div className="absolute inset-0 bg-wellness-pattern opacity-5"></div>
      
      <div className="relative container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => navigateTo('board')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Back to Board</span>
          </button>
          
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleSaveTip(selectedTip)}
              className={`p-3 rounded-full transition-all ${
                selectedTip.isSaved
                  ? 'bg-red-100 text-red-500 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-500'
              }`}
            >
              <Heart className={`w-6 h-6 ${selectedTip.isSaved ? 'fill-current' : ''}`} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-all"
            >
              <Share2 className="w-6 h-6" />
            </motion.button>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Gradient Header */}
          <div className="h-3 bg-gradient-to-r from-primary-500 to-wellness-lavender" />
          
          <div className="p-8">
            {/* Icon and Title */}
            <div className="flex items-start mb-6">
              <div className="text-5xl mr-4">{selectedTip.icon}</div>
              <div className="flex-1">
                <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                  {selectedTip.title}
                </h1>
                <p className="text-lg text-gray-600">
                  {selectedTip.shortDescription}
                </p>
              </div>
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center text-sm text-gray-500">
                <Target className="w-4 h-4 mr-2 text-primary-500" />
                <span className="font-medium">{selectedTip.category.replace('-', ' ')}</span>
              </div>
              {selectedTip.timeRequired && (
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-2 text-primary-500" />
                  <span className="font-medium">{selectedTip.timeRequired}</span>
                </div>
              )}
              {selectedTip.difficulty && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  selectedTip.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                  selectedTip.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedTip.difficulty.charAt(0).toUpperCase() + selectedTip.difficulty.slice(1)} Difficulty
                </span>
              )}
            </div>

            {/* Long Description */}
            {selectedTip.longDescription && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
                <div className="prose prose-lg text-gray-600 leading-relaxed">
                  {selectedTip.longDescription.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Benefits */}
            {selectedTip.benefits && selectedTip.benefits.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Benefits</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {selectedTip.benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-start bg-gradient-to-r from-primary-50 to-wellness-lavender/20 p-4 rounded-lg"
                    >
                      <CheckCircle className="w-5 h-5 text-primary-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Steps */}
            {selectedTip.steps && selectedTip.steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Get Started</h2>
                <div className="space-y-4">
                  {selectedTip.steps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-start group"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-primary-500 to-wellness-lavender text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                        {index + 1}
                      </div>
                      <div className="flex-1 bg-gray-50 p-4 rounded-lg group-hover:bg-gray-100 transition-colors">
                        <p className="text-gray-700">{step}</p>
                      </div>
                      <button
                        onClick={() => handleCopyStep(step, index)}
                        className="ml-3 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {copiedStep === index ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 p-6 bg-gradient-to-r from-primary-50 to-wellness-lavender/20 rounded-xl text-center"
            >
              <p className="text-lg font-medium text-gray-800 mb-4">
                Ready to start your wellness journey?
              </p>
              <div className="flex justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleSaveTip(selectedTip)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    selectedTip.isSaved
                      ? 'bg-white text-gray-700 hover:bg-gray-100'
                      : 'bg-gradient-to-r from-primary-500 to-wellness-lavender text-white hover:shadow-lg'
                  }`}
                >
                  {selectedTip.isSaved ? 'Remove from Saved' : 'Save This Tip'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigateTo('board')}
                  className="px-6 py-3 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-all"
                >
                  Explore More Tips
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TipDetail;