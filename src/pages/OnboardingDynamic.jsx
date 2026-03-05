import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';

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

      let activeSessionId = localStorage.getItem('passionia_active_session_id');

      if (!activeSessionId) {
        const sessions = await base44.entities.Session.list('-created_date', 1);
        if (sessions.length > 0 && !sessions[0].is_onboarding_done) {
          activeSessionId = sessions[0].id;
        } else {
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

      const sessions = await base44.entities.Session.filter({ id: activeSessionId });
      if (sessions.length > 0 && sessions[0].is_onboarding_done) {
        navigate(createPageUrl('OnboardingTransition'), { replace: true });
        return;
      }

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

      setAnswer('');
      setSelectedOption('');
      setCurrentQuestion(res.data.nextQuestion);
      setQuestionNumber(res.data.nextQuestion.number);
      if (res.data.nextQuestion.type === 'slider') {
        setSliderValue(res.data.nextQuestion.min || 0);
      }

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

  const isDisabled = sending ||
    (currentQuestion?.type === 'text' && !answer.trim()) ||
    (currentQuestion?.type === 'single_choice' && !selectedOption);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#fff', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#1a1a1a', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '14px', color: '#999' }}>Noah prépare tes questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#ffffff',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Progress bar — gradient top line */}
      <div style={{ width: '100%', height: '3px', background: '#f0f0f0' }}>
        <motion.div
          style={{ height: '100%', background: 'linear-gradient(90deg, #f97316, #ec4899, #a78bfa)', borderRadius: '0 4px 4px 0' }}
          initial={{ width: '0%' }}
          animate={{ width: `${(questionNumber / 11) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: '520px', textAlign: 'center' }}>

          {/* Badge pill — gradient */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#f5f5f5',
            border: '1px solid #e8e8e8',
            borderRadius: '100px',
            padding: '6px 16px',
            fontSize: '13px',
            color: '#666',
            marginBottom: '28px'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
              color: '#fff',
              padding: '2px 10px', borderRadius: '100px',
              fontSize: '11px', fontWeight: 600
            }}>NOAH™</span>
            Question {questionNumber}/11
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
                {/* Title */}
                <h1 style={{
                  fontSize: 'clamp(20px, 3.5vw, 28px)',
                  fontWeight: 500,
                  lineHeight: 1.3,
                  letterSpacing: '-0.02em',
                  color: '#1a1a1a',
                  marginBottom: '10px',
                }}>
                  {currentQuestion.title}
                </h1>

                {currentQuestion.subtitle && (
                  <p style={{
                    fontSize: '14px',
                    color: '#888',
                    lineHeight: 1.6,
                    maxWidth: '420px',
                    margin: '0 auto 28px',
                  }}>
                    {currentQuestion.subtitle}
                  </p>
                )}

                {!currentQuestion.subtitle && <div style={{ height: '16px' }} />}

                {/* Text input */}
                {currentQuestion.type === 'text' && (
                  <textarea
                    ref={textareaRef}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ta réponse..."
                    autoFocus
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      fontSize: '16px',
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 400,
                      color: '#1a1a1a',
                      background: '#f8f8f8',
                      border: '1px solid #e5e5e5',
                      borderRadius: '20px',
                      textAlign: 'left',
                      outline: 'none',
                      resize: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1a1a1a';
                      e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e5e5';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                )}

                {/* Single choice */}
                {currentQuestion.type === 'single_choice' && currentQuestion.options && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
                    {currentQuestion.options.map((option, idx) => (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        onClick={() => setSelectedOption(option)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '14px 20px',
                          borderRadius: '100px',
                          border: selectedOption === option ? '2px solid #1a1a1a' : '1px solid #e5e5e5',
                          background: selectedOption === option ? '#f5f5f5' : '#fff',
                          fontSize: '15px',
                          fontWeight: selectedOption === option ? 600 : 400,
                          fontFamily: "'Inter', sans-serif",
                          color: '#1a1a1a',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {option}
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Slider */}
                {currentQuestion.type === 'slider' && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                      <span style={{
                        fontSize: '52px', fontWeight: 700,
                        letterSpacing: '-0.03em', color: '#1a1a1a'
                      }}>{sliderValue}</span>
                      <span style={{ fontSize: '18px', color: '#bbb', marginLeft: '4px' }}>
                        / {currentQuestion.max || 15}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={currentQuestion.min || 0}
                      max={currentQuestion.max || 15}
                      step={currentQuestion.step || 1}
                      value={sliderValue}
                      onChange={(e) => setSliderValue(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#1a1a1a' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#bbb', marginTop: '8px' }}>
                      <span>{currentQuestion.min || 0} an</span>
                      <span>{currentQuestion.max || 15} ans</span>
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <div style={{ marginTop: '32px' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: '#f8f8f8',
                    borderRadius: '100px',
                    padding: '6px',
                    border: '1px solid #e5e5e5',
                    width: '100%',
                    maxWidth: '360px',
                  }}>
                    <button
                      onClick={handleSubmit}
                      disabled={isDisabled}
                      style={{
                        background: isDisabled ? '#ccc' : '#1a1a1a',
                        color: '#fff',
                        border: 'none',
                        padding: '14px 28px',
                        borderRadius: '100px',
                        fontSize: '15px',
                        fontWeight: 600,
                        fontFamily: "'Inter', sans-serif",
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'opacity 0.2s, background 0.2s',
                        width: '100%',
                      }}
                      onMouseOver={e => { if (!isDisabled) e.currentTarget.style.opacity = '0.85'; }}
                      onMouseOut={e => e.currentTarget.style.opacity = '1'}
                    >
                      {sending ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <>
                          Continuer <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}