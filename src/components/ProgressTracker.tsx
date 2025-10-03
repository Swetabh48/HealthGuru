import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, TrendingUp, Award,
  CheckCircle, Target, Sparkles, BarChart3
,  Flame
} from 'lucide-react';
import { useWellness } from '../contexts/WellnessContext';

const ProgressTracker: React.FC = () => {
  const { navigateTo, savedTips, progress} = useWellness();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

  // Calculate statistics
  const totalTips = savedTips.length;
  const completedToday = progress.filter(p => {
    const today = new Date();
    const progressDate = new Date(p.date);
    return progressDate.toDateString() === today.toDateString() && p.completed;
  }).length;

  const weeklyProgress = progress.filter(p => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(p.date) >= weekAgo && p.completed;
  }).length;

//   const monthlyProgress = progress.filter(p => {
//     const monthAgo = new Date();
//     monthAgo.setMonth(monthAgo.getMonth() - 1);
//     return new Date(p.date) >= monthAgo && p.completed;
//   }).length;

  const streak = calculateStreak(progress);
  const completionRate = totalTips > 0 ? Math.round((weeklyProgress / (totalTips * 7)) * 100) : 0;

  // Get category breakdown
  const categoryStats = savedTips.reduce((acc, tip) => {
    acc[tip.category] = (acc[tip.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-wellness-lavender/10 dark:from-gray-900 dark:via-purple-900/10 dark:to-indigo-900/10 transition-colors duration-300">
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
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Back to Board</span>
            </button>
            
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-2">
              Your Progress
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your wellness journey and celebrate your achievements
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-md">
            {(['week', 'month', 'all'] as const).map((period) => (
              <motion.button
                key={period}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  selectedPeriod === period
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {period === 'week' ? 'Week' : period === 'month' ? 'Month' : 'All Time'}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-3xl"
                >
                  🔥
                </motion.span>
              </div>
              <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Streak</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{streak}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">days in a row</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="text-3xl"
                >
                  ✨
                </motion.span>
              </div>
              <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed Today</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{completedToday}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">wellness actions</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <motion.span
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-3xl"
                >
                  📈
                </motion.span>
              </div>
              <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Weekly Progress</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{weeklyProgress}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">tips completed</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-3xl"
                >
                  🎯
                </motion.span>
              </div>
              <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completion Rate</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{completionRate}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">this week</p>
            </div>
          </motion.div>
        </div>

        {/* Achievement Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 mb-8"
        >
          <div className="flex items-center mb-6">
            <Award className="w-6 h-6 text-yellow-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Achievements</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Achievement Badges */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`p-4 rounded-xl border-2 ${
                streak >= 7
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-500'
                  : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 opacity-50'
              }`}
            >
              <div className="text-4xl mb-2">🏆</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Week Warrior</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Complete 7-day streak</p>
              {streak >= 7 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 font-semibold"
                >
                  ✓ Unlocked!
                </motion.div>
              )}
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`p-4 rounded-xl border-2 ${
                weeklyProgress >= 10
                  ? 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-500'
                  : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 opacity-50'
              }`}
            >
              <div className="text-4xl mb-2">💪</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Consistency King</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Complete 10 tips in a week</p>
              {weeklyProgress >= 10 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-semibold"
                >
                  ✓ Unlocked!
                </motion.div>
              )}
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`p-4 rounded-xl border-2 ${
                totalTips >= 5
                  ? 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-500'
                  : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 opacity-50'
              }`}
            >
              <div className="text-4xl mb-2">⭐</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Collection Master</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Save 5+ wellness tips</p>
              {totalTips >= 5 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-2 text-xs text-purple-600 dark:text-purple-400 font-semibold"
                >
                  ✓ Unlocked!
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 mb-8"
        >
          <div className="flex items-center mb-6">
            <BarChart3 className="w-6 h-6 text-purple-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Focus Areas</h2>
          </div>

          {topCategories.length > 0 ? (
            <div className="space-y-4">
              {topCategories.map(([category, count], index) => {
                const percentage = Math.round((count / totalTips) * 100);
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {category.replace('-', ' ').toUpperCase()}
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {count} tips ({percentage}%)
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                        className={`h-full rounded-full ${
                          index === 0
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500'
                            : index === 1
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                            : 'bg-gradient-to-r from-pink-500 to-rose-500'
                        }`}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                Start saving tips to see your focus areas!
              </p>
            </div>
          )}
        </motion.div>

        {/* Motivational Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-2xl shadow-xl p-8 text-center text-white"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="inline-block text-6xl mb-4"
          >
            ✨
          </motion.div>
          <h2 className="text-3xl font-bold mb-2">Keep Going!</h2>
          <p className="text-lg opacity-90 mb-4">
            You're on an amazing wellness journey. Every small step counts!
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigateTo('board')}
            className="px-8 py-3 bg-white text-purple-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Explore More Tips
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

// Helper function to calculate streak
function calculateStreak(progress: any[]): number {
  if (progress.length === 0) return 0;

  const sortedProgress = [...progress]
    .filter(p => p.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedProgress.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < sortedProgress.length; i++) {
    const progressDate = new Date(sortedProgress[i].date);
    progressDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((currentDate.getTime() - progressDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === streak) {
      streak++;
    } else if (daysDiff > streak) {
      break;
    }
  }

  return streak;
}

export default ProgressTracker;