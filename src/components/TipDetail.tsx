import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Clock, Target, CheckCircle, Share2, Copy, Check, Circle } from 'lucide-react';
import { useWellness } from '../contexts/WellnessContext';
import LoadingSpinner from './LoadingSpinner';

const TipDetail: React.FC = () => {
  const { selectedTip, isLoading, navigateTo, toggleSaveTip, toggleStepCompletion, addProgress } = useWellness();
  const [copiedStep, setCopiedStep] = React.useState<number | null>(null);

  if (!selectedTip) {
    return null;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const completedSteps = selectedTip.completedSteps || [];
  const totalSteps = selectedTip.steps?.length || 0;
  const completionPercentage = totalSteps > 0 ? Math.round((completedSteps.length / totalSteps) * 100) : 0;

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

  const handleStepToggle = (stepIndex: number) => {
    toggleStepCompletion(selectedTip.id, stepIndex);
    
    // If all steps completed, add progress entry
    const newCompletedSteps = completedSteps.includes(stepIndex)
      ? completedSteps.filter(i => i !== stepIndex)
      : [...completedSteps, stepIndex];
    
    if (newCompletedSteps.length === totalSteps && totalSteps > 0) {
      addProgress(selectedTip.id, true, 'Completed all steps');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-wellness-lavender/10 dark:from-gray-900 dark:via-purple-900/10 dark:to-indigo-900/10 transition-colors duration-300">
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
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Back to Board</span>
          </button>
          
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleSaveTip(selectedTip)}
              className={`p-3 rounded-full transition-all shadow-lg ${
                selectedTip.isSaved
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-gray-200 hover:text-red-500'
              }`}
            >
              <Heart className={`w-6 h-6 ${selectedTip.isSaved ? 'fill-current' : ''}`} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-all shadow-lg"
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
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-colors duration-300"
        >
          {/* Gradient Header */}
          <div className="h-3 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500" />
          
          <div className="p-8">
            {/* Icon and Title */}
            <div className="flex items-start mb-6">
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="text-5xl mr-4"
              >
                {selectedTip.icon}
              </motion.div>
              <div className="flex-1">
                <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
                  {selectedTip.title}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {selectedTip.shortDescription}
                </p>
              </div>
            </div>

            {/* Progress Bar (if steps exist) */}
            {totalSteps > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Your Progress
                  </span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    {completedSteps.length}/{totalSteps} steps • {completionPercentage}%
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  />
                </div>
                {completionPercentage === 100 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 flex items-center text-green-600 dark:text-green-400 text-sm font-semibold"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Congratulations! You've completed all steps! 🎉
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Target className="w-4 h-4 mr-2 text-purple-500" />
                <span className="font-medium">{selectedTip.category.replace('-', ' ')}</span>
              </div>
              {selectedTip.timeRequired && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4 mr-2 text-purple-500" />
                  <span className="font-medium">{selectedTip.timeRequired}</span>
                </div>
              )}
              {selectedTip.difficulty && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  selectedTip.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                  selectedTip.difficulty === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                  'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
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
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Overview</h2>
                <div className="prose prose-lg dark:prose-invert text-gray-600 dark:text-gray-400 leading-relaxed">
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
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Key Benefits</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {selectedTip.benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-start bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg"
                    >
                      <CheckCircle className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Steps with Checkboxes */}
            {selectedTip.steps && selectedTip.steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">How to Get Started</h2>
                <div className="space-y-3">
                  {selectedTip.steps.map((step, index) => {
                    const isCompleted = completedSteps.includes(index);
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex items-start group"
                      >
                        {/* Checkbox */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleStepToggle(index)}
                          className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 transition-all ${
                            isCompleted
                              ? 'bg-gradient-to-r from-purple-500 to-blue-500 border-transparent'
                              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-purple-400'
                          }`}
                        >
                          <AnimatePresence>
                            {isCompleted ? (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                              >
                                <Check className="w-5 h-5 text-white" />
                              </motion.div>
                            ) : (
                              <Circle className="w-4 h-4 text-gray-400" />
                            )}
                          </AnimatePresence>
                        </motion.button>

                        {/* Step Number Badge */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 transition-all ${
                          isCompleted
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}>
                          {index + 1}
                        </div>
                        
                        {/* Step Content */}
                        <div className={`flex-1 p-4 rounded-lg transition-all ${
                          isCompleted
                            ? 'bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20'
                            : 'bg-gray-50 dark:bg-gray-700 group-hover:bg-gray-100 dark:group-hover:bg-gray-600'
                        }`}>
                          <p className={`transition-all ${
                            isCompleted
                              ? 'text-gray-600 dark:text-gray-400 line-through'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {step}
                          </p>
                        </div>
                        
                        {/* Copy Button */}
                        <button
                          onClick={() => handleCopyStep(step, index)}
                          className="ml-3 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {copiedStep === index ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Copy className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                          )}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl text-center"
            >
              <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                Ready to start your wellness journey?
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleSaveTip(selectedTip)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all shadow-md ${
                    selectedTip.isSaved
                      ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                      : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg'
                  }`}
                >
                  {selectedTip.isSaved ? '❤️ Saved' : '🤍 Save This Tip'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigateTo('board')}
                  className="px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-all shadow-md"
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