import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, Target, ChevronRight, Sparkles, Check, Info, FileText } from 'lucide-react';
import { useWellness } from '../contexts/WellnessContext';
import { WellnessGoal, GOAL_LABELS, WELLNESS_ICONS} from '../types';

const ProfileCapture: React.FC = () => {
  const { setUserProfile, isLoading, error } = useWellness();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'prefer-not-to-say'>('prefer-not-to-say');
  const [selectedGoals, setSelectedGoals] = useState<WellnessGoal[]>([]);
  const [goalDescriptions, setGoalDescriptions] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const allGoals: WellnessGoal[] = [
    'weight-loss', 'muscle-gain', 'better-sleep', 'stress-management',
    'healthy-eating', 'mental-health', 'energy-boost', 'flexibility',
    'cardiovascular', 'mindfulness',
  ];

  const toggleGoal = (goal: WellnessGoal) => {
    setSelectedGoals(prev => {
      if (prev.includes(goal)) {
        // Remove goal and its description
        const newDescriptions = { ...goalDescriptions };
        delete newDescriptions[goal];
        setGoalDescriptions(newDescriptions);
        return prev.filter(g => g !== goal);
      }
      if (prev.length >= 3) {
        setErrors(prev => ({ ...prev, goals: 'Maximum 3 goals allowed' }));
        setTimeout(() => setErrors(prev => ({ ...prev, goals: '' })), 3000);
        return prev;
      }
      setErrors(prev => ({ ...prev, goals: '' }));
      return [...prev, goal];
    });
  };

  const updateGoalDescription = (goal: WellnessGoal, description: string) => {
    setGoalDescriptions(prev => ({
      ...prev,
      [goal]: description
    }));
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 2) {
      const ageNum = parseInt(age);
      if (!age || ageNum < 13 || ageNum > 120 || isNaN(ageNum)) {
        newErrors.age = 'Please enter a valid age (13-120)';
      }
    }
    
    if (currentStep === 3) {
      if (selectedGoals.length === 0) {
        newErrors.goals = 'Please select at least one wellness goal';
      }
    }

    if (currentStep === 4) {
      // Check if all selected goals have descriptions
      const missingDescriptions = selectedGoals.filter(
        goal => !goalDescriptions[goal] || goalDescriptions[goal].trim().length < 10
      );
      if (missingDescriptions.length > 0) {
        newErrors.descriptions = 'Please provide detailed descriptions (at least 10 characters) for all selected goals';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(4)) return;
    
    await setUserProfile({
      name: name || undefined,
      age: parseInt(age),
      gender,
      goals: selectedGoals,
      goalDescriptions
    });
  };

  const progressPercentage = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20 relative overflow-hidden transition-colors duration-500">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-20 -right-20 w-96 h-96 bg-purple-400 dark:bg-purple-600 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -5, 0],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-400 dark:bg-blue-600 rounded-full blur-3xl"
        />
      </div>
      
      <div className="relative container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 mb-4 shadow-lg"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Your Wellness Journey Starts Here
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            Let's create a personalized health plan tailored just for you
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Step {step} of 4</span>
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-3 bg-white/80 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-full shadow-lg"
            />
          </div>
        </motion.div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg shadow-md"
            >
              <div className="flex items-center">
                <Info className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20 dark:border-gray-700/50 transition-colors duration-300"
        >
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {/* Step 1: Name */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8">
                    <label className="flex items-center text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                      <User className="w-6 h-6 mr-3 text-purple-500" />
                      What should we call you?
                      <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-6 py-4 text-lg border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-500/30 focus:border-purple-400 transition-all outline-none"
                      autoFocus
                    />
                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <Info className="w-4 h-4 mr-2" />
                      We'll use this to personalize your experience
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Age & Gender */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8">
                    <label className="flex items-center text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                      <Calendar className="w-6 h-6 mr-3 text-purple-500" />
                      How old are you?
                      <span className="ml-2 text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => {
                        setAge(e.target.value);
                        setTouched(prev => ({ ...prev, age: true }));
                        setErrors(prev => ({ ...prev, age: '' }));
                      }}
                      onBlur={() => setTouched(prev => ({ ...prev, age: true }))}
                      placeholder="Enter your age"
                      min="13"
                      max="120"
                      className={`w-full px-6 py-4 text-lg border-2 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-500/30 transition-all outline-none ${
                        errors.age && touched.age
                          ? 'border-red-300 focus:border-red-400'
                          : 'border-gray-200 dark:border-gray-600 focus:border-purple-400'
                      }`}
                      autoFocus
                    />
                    <AnimatePresence>
                      {errors.age && touched.age && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center"
                        >
                          <Info className="w-4 h-4 mr-1" />
                          {errors.age}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="mb-8">
                    <label className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 block">
                      Gender
                      <span className="ml-2 text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['male', 'female', 'other', 'prefer-not-to-say'] as const).map((option) => (
                        <motion.button
                          key={option}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setGender(option)}
                          className={`relative px-6 py-4 rounded-xl border-2 font-medium transition-all ${
                            gender === option
                              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white border-transparent shadow-lg'
                              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-purple-300 hover:shadow-md'
                          }`}
                        >
                          {gender === option && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-2 right-2"
                            >
                              <Check className="w-5 h-5" />
                            </motion.div>
                          )}
                          {option.charAt(0).toUpperCase() + option.slice(1).replace('-', ' ')}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Goals Selection */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8">
                    <label className="flex items-center text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                      <Target className="w-6 h-6 mr-3 text-purple-500" />
                      What are your wellness goals?
                      <span className="ml-2 text-red-500">*</span>
                    </label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 flex items-center">
                      <Info className="w-4 h-4 mr-2 flex-shrink-0" />
                      Select up to 3 goals that matter most to you
                    </p>
                    
                    {/* Selected Count */}
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        {selectedGoals.map(goal => (
                          <motion.span
                            key={goal}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 text-purple-700 dark:text-purple-300 text-xs rounded-full font-medium"
                          >
                            {WELLNESS_ICONS[goal]} {GOAL_LABELS[goal]}
                          </motion.span>
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {selectedGoals.length}/3 selected
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {allGoals.map((goal) => {
                        const isSelected = selectedGoals.includes(goal);
                        const isDisabled = !isSelected && selectedGoals.length >= 3;
                        
                        return (
                          <motion.button
                            key={goal}
                            type="button"
                            whileHover={!isDisabled ? { scale: 1.05, y: -2 } : {}}
                            whileTap={!isDisabled ? { scale: 0.95 } : {}}
                            onClick={() => !isDisabled && toggleGoal(goal)}
                            disabled={isDisabled}
                            className={`relative p-4 rounded-xl border-2 transition-all ${
                              isSelected
                                ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white border-transparent shadow-lg'
                                : isDisabled
                                ? 'bg-gray-50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 cursor-not-allowed opacity-50'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-purple-300 hover:shadow-md'
                            }`}
                          >
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                              >
                                <Check className="w-4 h-4 text-purple-500" />
                              </motion.div>
                            )}
                            <div className="flex flex-col items-center">
                              <span className="text-3xl mb-2">{WELLNESS_ICONS[goal]}</span>
                              <span className="text-xs font-medium text-center leading-tight">
                                {GOAL_LABELS[goal]}
                              </span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                    
                    <AnimatePresence>
                      {errors.goals && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 text-sm text-red-600 dark:text-red-400 flex items-center"
                        >
                          <Info className="w-4 h-4 mr-1" />
                          {errors.goals}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Goal Descriptions */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8">
                    <label className="flex items-center text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                      <FileText className="w-6 h-6 mr-3 text-purple-500" />
                      Tell us more about your goals
                      <span className="ml-2 text-red-500">*</span>
                    </label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 flex items-center">
                      <Info className="w-4 h-4 mr-2 flex-shrink-0" />
                      Help us create better recommendations by describing what you want to achieve
                    </p>

                    <div className="space-y-6">
                      {selectedGoals.map((goal, index) => (
                        <motion.div
                          key={goal}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative"
                        >
                          <div className="flex items-center mb-3">
                            <span className="text-2xl mr-3">{WELLNESS_ICONS[goal]}</span>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                              {GOAL_LABELS[goal]}
                            </h3>
                          </div>
                          <textarea
                            value={goalDescriptions[goal] || ''}
                            onChange={(e) => updateGoalDescription(goal, e.target.value)}
                            placeholder={`Example: I want to ${goal === 'weight-loss' ? 'lose 10kg in 3 months through healthy eating and exercise' : goal === 'better-sleep' ? 'improve my sleep quality and wake up feeling refreshed' : 'achieve better overall wellness'}`}
                            rows={3}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-500/30 focus:border-purple-400 transition-all outline-none resize-none"
                          />
                          <div className="mt-1 flex justify-between items-center text-xs">
                            <span className="text-gray-500 dark:text-gray-400">
                              {(goalDescriptions[goal] || '').length} / 200 characters
                            </span>
                            {goalDescriptions[goal] && goalDescriptions[goal].length >= 10 && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-green-600 dark:text-green-400 flex items-center"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Complete
                              </motion.span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <AnimatePresence>
                      {errors.descriptions && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 text-sm text-red-600 dark:text-red-400 flex items-center"
                        >
                          <Info className="w-4 h-4 mr-1" />
                          {errors.descriptions}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              {step > 1 ? (
                <motion.button
                  type="button"
                  onClick={prevStep}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  ← Previous
                </motion.button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <motion.button
                  type="button"
                  onClick={nextStep}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="ml-auto px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center"
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-2" />
                </motion.button>
              ) : (
                <motion.button
                  type="submit"
                  disabled={isLoading || selectedGoals.length === 0}
                  whileHover={!isLoading ? { scale: 1.05 } : {}}
                  whileTap={!isLoading ? { scale: 0.95 } : {}}
                  className="ml-auto px-8 py-3 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Get My Plan
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </form>
        </motion.div>

         {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid md:grid-cols-3 gap-4"
        >
          {[
            { icon: '🎯', title: 'AI-Powered', desc: 'Smart recommendations tailored to you' },
            { icon: '📊', title: 'Evidence-Based', desc: 'Backed by wellness research' },
            { icon: '💾', title: 'Save & Track', desc: 'Keep your favorite tips handy' },
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-5 text-center shadow-md hover:shadow-lg transition-all"
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stay Tuned Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/50 text-center">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="inline-block text-2xl mb-2"
            >
              ✨
            </motion.div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent mb-1">
              Stay Tuned for More Updates!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Exciting new features and wellness tools coming soon
            </p>
          </div>
        </motion.div>

        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-gradient-to-br from-white/90 to-purple-50/90 dark:from-gray-800/90 dark:to-purple-900/20 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-purple-100 dark:border-purple-900/30"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg mr-4"
            >
              <span className="text-3xl">👨‍💻</span>
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">About the Creator</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Built with passion for your wellness</p>
            </div>
          </div>

          <div className="space-y-4 text-center">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              <span className="font-semibold text-purple-600 dark:text-purple-400">HealthGuru</span> was created to make personalized wellness accessible to everyone. 
              Using cutting-edge AI technology, we transform your unique health goals into actionable, evidence-based recommendations.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 pt-4">
              <div className="p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl">
                <div className="text-2xl mb-2">🤖</div>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1">AI-Powered</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Gemini AI Integration</p>
              </div>
              <div className="p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl">
                <div className="text-2xl mb-2">⚛️</div>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1">Modern Stack</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">React + TypeScript</p>
              </div>
              <div className="p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl">
                <div className="text-2xl mb-2">💜</div>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1">Open Source</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Assignment</p>
              </div>
            </div>

            <div className="pt-4 border-t border-purple-200 dark:border-purple-800">
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                "The journey is yours alone. Go beyond the standard—your extraordinary results depend on it."
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-2">
                — Swetabh Salampuria, Founder
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileCapture;