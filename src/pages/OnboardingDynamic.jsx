import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, Brain, Send } from 'lucide-react';
import { NoahBrainIcon } from '@/components/NoahBrainIcon';

export default function OnboardingDynamic() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [sliderValue, setSliderValue] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const textareaRef = useRef(null);

  useEffect(() => {
    initOnboarding();
  }, []);

  const initOnboarding = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl('OnboardingFirstName'));
        return;
      }

      const user = await base44.auth.me();
      const name = user.firstName || localStorage.getItem('onboarding_firstName') || '';
      setFirstName(name);

      // Get or create session
      let activeSessionId = localStorage.getItem('passionia_active_session_id');
      
      if (!activeSessionId) {
        // Check existing sessions
        const sessions = await base44.entities.Session.list('-created_date', 1);
        if (sessions.length > 0 && !sessions[0].is_onboarding_done) {
          activeSessionId = sessions[0].id;
        } else {
          // Create new session
          const res = await base44.functions.invoke('createNewSession', {});
          if (res.data.success) {
            activeSessionId = res.data.session.id;
          } else {
            console.error('Failed to create session:', res.data);
            return;
          }
        }
        localStorage.setItem('passionia_active_session_id', activeSessionId);
      }

      setSessionId(activeSessionId);

      // Check session state
      const sessions = await base44.entities.Session.filter({ id: activeSessionId });
      if (sessions.length > 0 && sessions[0].is_onboarding_done) {
        navigate(createPageUrl('OnboardingTransition'), { replace: true });
        return;
      }

      // Fetch first/next question
      const res = await base44.functions.invoke('onboardingNextQuestion', {
        sessionId: activeSessionId,
        firstName: name
      });

      if (res.data.done || res.data.isDone) {
        navigate(createPageUrl('OnboardingTransition'), { replace: true });
        return;
      }

      setCurrentQuestion(res.data.nextQuestion);
      setQuestionNumber(res.data.nextQuestion.number);
      if (res.data.nextQuestion.type === 'slider') {
        setSliderValue(res.data.nextQuestion.min || 0);
      }
    } catch (err) {
      console.error('Init onboarding error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (sending) return;

    let userAnswer;
    if (currentQuestion.type === 'single_choice') {
      if (!selectedOption) return;
      userAnswer = selectedOption;
    } else if (currentQuestion.type === 'slider') {
      userAnswer = String(sliderValue);
    } else {
      if (!answer.trim()) return;
      userAnswer = answer.trim();
    }

    setSending(true);

    try {
      const res = await base44.functions.invoke('onboardingNextQuestion', {
        sessionId,
        userAnswer,
        firstName
      });

      if (res.data.done || res.data.isDone) {
        navigate(createPageUrl('OnboardingTransition'));
        return;
      }

      // Reset inputs
      setAnswer('');
      setSelectedOption('');
      setCurrentQuestion(res.data.nextQuestion);
      setQuestionNumber(res.data.nextQuestion.number);
      if (res.data.nextQuestion.type === 'slider') {
        setSliderValue(res.data.nextQuestion.min || 0);
      }

      // Focus textarea
      setTimeout(() => textareaRef.current?.focus(), 300);
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && currentQuestion?.type === 'text') {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#61f7a2] mx-auto mb-3" />
          <p className="text-sm text-gray-500">Noah prépare tes questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      {/* Progress bar */}
      <div className="w-full bg-gray-100 h-1.5">
        <motion.div
          className="h-full bg-gradient-to-r from-[#61f7a2] to-[#2dd4bf] rounded-r-full"
          initial={{ width: '0%' }}
          animate={{ width: `${(questionNumber / 11) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">

          {/* Noah avatar + question counter */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#61f7a2] flex items-center justify-center shadow-sm shadow-[#61f7a2]/30">
              <Brain size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#2dd4bf]">Noah</p>
              <p className="text-xs text-gray-400">Question {questionNumber}/11</p>
            </div>
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            {currentQuestion && (
              <motion.div
                key={questionNumber}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-[22px] font-bold text-gray-900 leading-tight mb-2">
                  {currentQuestion.title}
                </h2>
                {currentQuestion.subtitle && (
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                    {currentQuestion.subtitle}
                  </p>
                )}

                {/* Text input */}
                {currentQuestion.type === 'text' && (
                  <div className="mt-4">
                    <textarea
                      ref={textareaRef}
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ta réponse..."
                      autoFocus
                      rows={3}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#61f7a2]/50 focus:border-[#61f7a2] transition-all resize-none"
                    />
                  </div>
                )}

                {/* Single choice */}
                {currentQuestion.type === 'single_choice' && currentQuestion.options && (
                  <div className="mt-4 space-y-2.5">
                    {currentQuestion.options.map((option, idx) => (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        onClick={() => {
                          setSelectedOption(option);
                          // Auto-submit on choice
                          setTimeout(() => {
                            setSelectedOption(option);
                          }, 100);
                        }}
                        className={`w-full text-left px-4 py-3.5 rounded-2xl border transition-all text-[15px] font-medium ${
                          selectedOption === option
                            ? 'bg-[#61f7a2]/10 border-[#61f7a2] text-gray-900'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {option}
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Slider */}
                {currentQuestion.type === 'slider' && (
                  <div className="mt-6 space-y-4">
                    <div className="text-center">
                      <span className="text-4xl font-bold text-[#61f7a2]">{sliderValue}</span>
                      <span className="text-lg text-gray-400 ml-1">/ {currentQuestion.max || 15}</span>
                    </div>
                    <input
                      type="range"
                      min={currentQuestion.min || 0}
                      max={currentQuestion.max || 15}
                      step={currentQuestion.step || 1}
                      value={sliderValue}
                      onChange={(e) => setSliderValue(Number(e.target.value))}
                      className="w-full accent-[#61f7a2]"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{currentQuestion.min || 0} an</span>
                      <span>{currentQuestion.max || 15} ans</span>
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={handleSubmit}
                  disabled={sending || (currentQuestion.type === 'text' && !answer.trim()) || (currentQuestion.type === 'single_choice' && !selectedOption)}
                  className="w-full mt-6 flex items-center justify-center gap-2.5 py-[16px] px-6 bg-gradient-to-b from-gray-900 to-black text-white rounded-2xl text-[16px] font-bold shadow-lg shadow-black/15 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Continuer
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}