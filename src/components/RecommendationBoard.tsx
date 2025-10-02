import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Bookmark, User, LogOut, Sparkles } from 'lucide-react';
import { useWellness } from '../contexts/WellnessContext';
import TipCard from './TipCard';
import LoadingSpinner from './LoadingSpinner';

const RecommendationBoard: React.FC = () => {
  const {
    userProfile,
    recommendations,
    isLoading,
    error,
    regenerateRecommendations,
    navigateTo,
    clearSession,
    savedTips,
  } = useWellness();

  if (isLoading) {
    return <LoadingSpinner />;
  }

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
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2">
              {userProfile?.name ? `${userProfile.name}'s` : 'Your'} Wellness Board
            </h1>
            <p className="text-gray-600">
              Personalized recommendations based on your wellness goals
            </p>
          </div>
          
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigateTo('saved')}
              className="relative bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Bookmark className="w-5 h-5 text-primary-500" />
              <span className="font-medium">Saved</span>
              {savedTips.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {savedTips.length}
                </span>
              )}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={regenerateRecommendations}
              disabled={isLoading}
              className="bg-gradient-to-r from-primary-500 to-wellness-lavender text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="font-medium">Regenerate</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearSession}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium hidden md:inline">New Profile</span>
            </motion.button>
          </div>
        </motion.div>

        {/* User Info Bar */}
        {userProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 mb-8"
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {userProfile.age} years old • {userProfile.gender}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-wellness-lavender" />
                <span className="text-sm font-medium text-gray-700">Goals:</span>
                <div className="flex gap-2">
                  {userProfile.goals.map(goal => (
                    <span
                      key={goal}
                      className="px-2 py-1 bg-gradient-to-r from-primary-100 to-wellness-lavender/20 text-primary-700 text-xs rounded-full font-medium"
                    >
                      {goal.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Recommendations Grid */}
        <AnimatePresence mode="wait">
          {recommendations.length > 0 ? (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {recommendations.map((tip, index) => (
                <TipCard key={tip.id} tip={tip} index={index} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                <Sparkles className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No recommendations yet
              </h3>
              <p className="text-gray-500 mb-4">
                Click "Regenerate" to create new wellness tips
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={regenerateRecommendations}
                className="bg-gradient-to-r from-primary-500 to-wellness-lavender text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Generate Recommendations
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feature Cards */}
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 grid md:grid-cols-4 gap-4"
          >
            {[
              { icon: '🎯', title: 'Personalized', value: 'Just for you' },
              { icon: '🔄', title: 'Refreshable', value: 'New tips anytime' },
              { icon: '💾', title: 'Saveable', value: `${savedTips.length} saved` },
              { icon: '📊', title: 'Trackable', value: 'Monitor progress' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-white/80 backdrop-blur-sm rounded-lg p-4 text-center shadow-md"
              >
                <div className="text-2xl mb-2">{stat.icon}</div>
                <h3 className="font-semibold text-gray-800">{stat.title}</h3>
                <p className="text-sm text-gray-600">{stat.value}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RecommendationBoard;