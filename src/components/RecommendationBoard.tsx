import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Bookmark, User, LogOut, Sparkles, TrendingUp, Filter } from 'lucide-react';
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

  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Filter recommendations
  const filteredRecommendations = filterDifficulty
    ? recommendations.filter(tip => tip.difficulty === filterDifficulty)
    : recommendations;

  const difficulties = ['easy', 'medium', 'hard'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-wellness-lavender/10 dark:from-gray-900 dark:via-purple-900/10 dark:to-indigo-900/10 transition-colors duration-300">
      <div className="absolute inset-0 bg-wellness-pattern opacity-5"></div>
      
      <div className="relative container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-2">
              {userProfile?.name ? `${userProfile.name}'s` : 'Your'} Wellness Board
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Personalized recommendations based on your wellness goals
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigateTo('progress')}
              className="relative bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Progress</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigateTo('saved')}
              className="relative bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Bookmark className="w-5 h-5 text-purple-500" />
              <span className="font-medium text-gray-700 dark:text-gray-200">Saved</span>
              {savedTips.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                >
                  {savedTips.length}
                </motion.span>
              )}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={regenerateRecommendations}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="font-medium hidden sm:inline">Regenerate</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearSession}
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center gap-2"
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
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-md p-4 mb-8"
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {userProfile.age} years old • {userProfile.gender}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Goals:</span>
                <div className="flex flex-wrap gap-2">
                  {userProfile.goals.map(goal => (
                    <motion.span
                      key={goal}
                      whileHover={{ scale: 1.05 }}
                      className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full font-medium cursor-default"
                    >
                      {goal.replace('-', ' ')}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Filter Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  showFilters || filterDifficulty
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filter</span>
                {filterDifficulty && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 bg-purple-500 rounded-full"
                  />
                )}
              </motion.button>
            </div>

            {/* Filter Options */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Difficulty:</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFilterDifficulty(null)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                        !filterDifficulty
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      All
                    </motion.button>
                    {difficulties.map(diff => (
                      <motion.button
                        key={diff}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFilterDifficulty(diff)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                          filterDifficulty === diff
                            ? diff === 'easy'
                              ? 'bg-green-500 text-white'
                              : diff === 'medium'
                              ? 'bg-yellow-500 text-white'
                              : 'bg-red-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Recommendations Grid */}
        <AnimatePresence mode="wait">
          {filteredRecommendations.length > 0 ? (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredRecommendations.map((tip, index) => (
                <TipCard key={tip.id} tip={tip} index={index} />
              ))}
            </motion.div>
          ) : recommendations.length > 0 ? (
            <motion.div
              key="no-filter-results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <Filter className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No tips match this filter
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Try adjusting your filter settings
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterDifficulty(null)}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Clear Filter
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 mb-4">
                <Sparkles className="w-10 h-10 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No recommendations yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Click "Regenerate" to create new wellness tips
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={regenerateRecommendations}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Generate Recommendations
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feature Cards */}
        {filteredRecommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { icon: '🎯', title: 'Personalized', value: 'Just for you', color: 'from-purple-500 to-blue-500' },
              { icon: '🔄', title: 'Refreshable', value: 'New tips anytime', color: 'from-blue-500 to-cyan-500' },
              { icon: '💾', title: 'Saveable', value: `${savedTips.length} saved`, color: 'from-pink-500 to-rose-500' },
              { icon: '📊', title: 'Trackable', value: 'Monitor progress', color: 'from-green-500 to-emerald-500' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 text-center shadow-md relative overflow-hidden group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                <div className="relative">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="text-3xl mb-2"
                  >
                    {stat.icon}
                  </motion.div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{stat.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RecommendationBoard;