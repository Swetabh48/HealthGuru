import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Target, ChevronRight, Sparkles } from 'lucide-react';
import { useWellness } from '../contexts/WellnessContext';
import { WellnessGoal, GOAL_LABELS, WELLNESS_ICONS } from '../types';

const ProfileCapture: React.FC = () => {
  const { setUserProfile, isLoading } = useWellness();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'prefer-not-to-say'>('prefer-not-to-say');
  const [selectedGoals, setSelectedGoals] = useState<WellnessGoal[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const allGoals: WellnessGoal[] = [
    'weight-loss',
    'muscle-gain',
    'better-sleep',
    'stress-management',
    'healthy-eating',
    'mental-health',
    'energy-boost',
    'flexibility',
    'cardiovascular',
    'mindfulness',
  ];

  const toggleGoal = (goal: WellnessGoal) => {
    setSelectedGoals(prev => {
      if (prev.includes(goal)) {
        return prev.filter(g => g !== goal);
      }
      if (prev.length >= 3) {
        setErrors(prev => ({ ...prev, goals: 'Maximum 3 goals allowed' }));
        return prev;
      }
      setErrors(prev => ({ ...prev, goals: '' }));
      return [...prev, goal];
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    const ageNum = parseInt(age);
    if (!age || ageNum < 13 || ageNum > 120) {
      newErrors.age = 'Please enter a valid age (13-120)';
    }
    
    if (selectedGoals.length === 0) {
      newErrors.goals = 'Please select at least one goal';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    await setUserProfile({
      name: name || undefined,
      age: parseInt(age),
      gender,
      goals: selectedGoals,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-wellness-lavender/10">
      <div className="absolute inset-0 bg-wellness-pattern opacity-5"></div>
      
      <div className="relative container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-wellness-lavender mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
            Welcome to Your Wellness Journey
          </h1>
          <p className="text-lg text-gray-600">
            Let's personalize your health recommendations
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Name Field */}
          <div className="mb-6">
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <User className="w-4 h-4 mr-2 text-primary-500" />
              Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Age Field */}
          <div className="mb-6">
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4 mr-2 text-primary-500" />
              Age *
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter your age"
              min="13"
              max="120"
              className={`w-full px-4 py-3 border ${
                errors.age ? 'border-red-300' : 'border-gray-200'
              } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
            />
            {errors.age && (
              <p className="mt-1 text-sm text-red-600">{errors.age}</p>
            )}
          </div>

          {/* Gender Field */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Gender *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['male', 'female', 'other', 'prefer-not-to-say'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setGender(option)}
                  className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                    gender === option
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300'
                  }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Goals Selection */}
          <div className="mb-8">
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Target className="w-4 h-4 mr-2 text-primary-500" />
              Select Your Wellness Goals * (Max 3)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {allGoals.map((goal) => (
                <motion.button
                  key={goal}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleGoal(goal)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    selectedGoals.includes(goal)
                      ? 'bg-gradient-to-r from-primary-500 to-wellness-lavender text-white border-transparent shadow-lg'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-2xl mb-1">{WELLNESS_ICONS[goal]}</span>
                    <span className="text-xs font-medium">{GOAL_LABELS[goal]}</span>
                  </div>
                </motion.button>
              ))}
            </div>
            {errors.goals && (
              <p className="mt-2 text-sm text-red-600">{errors.goals}</p>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-primary-500 to-wellness-lavender text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating Your Plan...
              </div>
            ) : (
              <div className="flex items-center">
                Get My Personalized Tips
                <ChevronRight className="w-5 h-5 ml-2" />
              </div>
            )}
          </motion.button>
        </motion.form>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8 grid md:grid-cols-3 gap-4"
        >
          {[
            { icon: '🎯', title: 'Personalized', desc: 'AI-powered recommendations' },
            { icon: '📊', title: 'Evidence-based', desc: 'Backed by wellness research' },
            { icon: '💾', title: 'Save & Track', desc: 'Keep your favorite tips' },
          ].map((item, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">{item.icon}</div>
              <h3 className="font-semibold text-gray-800">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileCapture;