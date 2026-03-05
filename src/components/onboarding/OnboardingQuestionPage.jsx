import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Loader2, Paperclip, X, Rocket, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

const BLOCK_CONFIG = {
  profile: {
    title: 'Ton profil',
    pages: ['OnboardingQ12AgeRange', 'OnboardingQ13Gender', 'OnboardingQ14Family', 'OnboardingQ15CurrentIncome'],
    totalQuestions: 4
  },
  objectives: {
    title: 'Tes objectifs',
    pages: ['OnboardingQ16TargetIncome', 'OnboardingQ17TargetDelay', 'OnboardingQ18LifeChange', 'OnboardingQ19Impact', 'OnboardingQ20Emotions', 'OnboardingQ21Relatives', 'OnboardingQ22Lifestyle', 'OnboardingQ23Obstacles', 'OnboardingQ24IfNothingChanges', 'OnboardingQ25Readiness', 'OnboardingQ26DeliveryPreferences'],
    totalQuestions: 11
  }
};

export default function OnboardingQuestionPage({
  questionId,
  title,
  subtitle,
  inputType = 'textarea',
  options = [],
  sliderConfig = { min: 0, max: 10, step: 1, suffix: '' },
  placeholder = '',
  fieldName,
  nextPage,
  prevPage,
  progress,
  buttonText = 'Continuer',
  blockType = null,
  useLocalStorage = false,
  customHandleSave = null,
  autoSubmit = false,
  completedSteps = [],
  isLastQuestion = false
}) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [value, setValue] = useState(inputType === 'checkbox' ? [] : inputType === 'slider' ? sliderConfig.min : '');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const isSavingRef = useRef(false);
  const fileInputRef = useRef(null);

  const currentQuestion = blockType && BLOCK_CONFIG[blockType]
    ? BLOCK_CONFIG[blockType].pages.indexOf(window.location.pathname.split('/').pop()) + 1
    : 0;
  const totalQuestions = blockType && BLOCK_CONFIG[blockType] ? BLOCK_CONFIG[blockType].totalQuestions : 0;

  // Total progress across all static questions (Q12-Q26 = 15 questions)
  const allPages = [...BLOCK_CONFIG.profile.pages, ...BLOCK_CONFIG.objectives.pages];
  const globalIndex = allPages.indexOf(window.location.pathname.split('/').pop());
  const globalProgress = globalIndex >= 0 ? ((globalIndex + 1) / allPages.length) * 100 : progress;

  useEffect(() => { loadUser(); }, []);

  const loadUser = async () => {
    try {
      if (useLocalStorage) {
        const firstName = localStorage.getItem('onboarding_firstName') || '';
        const storedValue = localStorage.getItem(`onboarding_${fieldName}`);
        setUser({ firstName });
        if (storedValue) {
          setValue(inputType === 'checkbox' ? JSON.parse(storedValue) : storedValue);
        }
      } else {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        if (currentUser[fieldName] !== undefined && currentUser[fieldName] !== null) {
          setValue(currentUser[fieldName]);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const replaceVariables = (text) => {
    if (!text) return text;
    let result = text;
    if (useLocalStorage) {
      const targetIncome = localStorage.getItem('onboarding_targetIncome') || '';
      const targetIncomeDelay = localStorage.getItem('onboarding_targetIncomeDelay') || '';
      result = result
        .replace(/\{\{user\.targetIncome\}\}/g, targetIncome)
        .replace(/\{\{user\.targetIncomeDelay\}\}/g, targetIncomeDelay);
    }
    if (user) {
      result = result
        .replace(/\{\{user\.firstName\}\}/g, user.firstName || '')
        .replace(/\{\{user\.coreSkill\}\}/g, user.coreSkill || '')
        .replace(/\{\{user\.targetIncome\}\}/g, user.targetIncome || '')
        .replace(/\{\{user\.targetIncomeDelay\}\}/g, user.targetIncomeDelay || '');
    }
    return result;
  };

  const handleNext = async () => {
    if (!canProceed()) return;
    if (isSavingRef.current) return;

    isSavingRef.current = true;
    setIsSaving(true);

    try {
      if (customHandleSave) {
        await customHandleSave(user, value);
        navigate(createPageUrl(nextPage));
        return;
      }

      if (useLocalStorage) {
        localStorage.setItem(`onboarding_${fieldName}`,
          inputType === 'checkbox' ? JSON.stringify(value) : value
        );
        try {
          const currentUser = await base44.auth.me();
          const resolvedSessionId = localStorage.getItem('passionia_active_session_id') || currentUser?.sessionId;
          if (resolvedSessionId) {
            const sessions = await base44.entities.Session.filter({ id: resolvedSessionId });
            if (sessions.length > 0) {
              const session = sessions[0];
              const existingData = session.onboarding_full || {};
              const updatedData = { ...existingData, [fieldName]: inputType === 'checkbox' ? value : value };
              await base44.entities.Session.update(resolvedSessionId, { onboarding_full: updatedData });
            }
          }
        } catch (backendError) {
          console.warn('⚠️ Backend save failed:', backendError);
        }
        navigate(createPageUrl(nextPage));
        return;
      }

      await base44.auth.updateMe({ [fieldName]: value });
      const activeSessionId = localStorage.getItem('passionia_active_session_id') || user.sessionId;
      if (activeSessionId && fieldName) {
        try {
          const sessions = await base44.entities.Session.filter({ id: activeSessionId });
          if (sessions.length > 0) {
            const session = sessions[0];
            const existingData = session.onboarding_full || {};
            const updatedData = { ...existingData, [fieldName]: value };
            await base44.entities.Session.update(activeSessionId, { onboarding_full: updatedData });
          }
        } catch (backendError) {
          console.error('❌ Backend call failed:', backendError);
        }
        if (fieldName === 'deliveryPreferences') {
          try {
            const sessions = await base44.entities.Session.filter({ id: activeSessionId });
            if (sessions.length > 0) {
              const session = sessions[0];
              await base44.asServiceRole.entities.Session.update(activeSessionId, {
                onboarding_summary: { ...(session.onboarding_summary || {}), format_preferences: value }
              });
            }
          } catch (e) {
            console.warn('⚠️ Could not sync format_preferences:', e);
          }
        }
      }
      if (nextPage === 'OfferGenerationStart') {
        await base44.auth.updateMe({ onboarding_completed: true });
      }
      navigate(createPageUrl(nextPage));
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Erreur lors de la sauvegarde. Réessaye.');
    } finally {
      setIsSaving(false);
      isSavingRef.current = false;
    }
  };

  const handleBack = () => {
    if (prevPage) navigate(createPageUrl(prevPage));
  };

  const canProceed = () => {
    if (inputType === 'checkbox') return value.length > 0;
    if (inputType === 'slider') return true;
    if (inputType === 'radio') return value !== '';
    return value && value.trim() !== '';
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const { data } = await base44.integrations.Core.UploadFile({ file });
      setAttachedFiles([...attachedFiles, { name: file.name, url: data.file_url }]);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  const handleCheckboxChange = (option, checked) => {
    if (checked) {
      setValue([...value, option]);
    } else {
      setValue(value.filter(v => v !== option));
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#fff', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#1a1a1a' }} />
      </div>
    );
  }

  const isDisabled = isSaving || !canProceed();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#ffffff',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Progress bar — gradient */}
      <div style={{ width: '100%', height: '3px', background: '#f0f0f0' }}>
        <motion.div
          style={{ height: '100%', background: 'linear-gradient(90deg, #f97316, #ec4899, #a78bfa)', borderRadius: '0 4px 4px 0' }}
          initial={{ width: '0%' }}
          animate={{ width: `${globalProgress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Floating neon circles */}
        <div className="oqp-neon oqp-neon-1" />
        <div className="oqp-neon oqp-neon-2" />
        <div className="oqp-neon oqp-neon-3" />

        <div style={{ width: '100%', maxWidth: '520px', textAlign: 'center', position: 'relative', zIndex: 1 }}>

          {/* Badge pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#f5f5f5', border: '1px solid #e8e8e8',
            borderRadius: '100px', padding: '6px 16px',
            fontSize: '13px', color: '#666', marginBottom: '28px'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
              color: '#fff', padding: '2px 10px', borderRadius: '100px',
              fontSize: '11px', fontWeight: 600
            }}>NOAH™</span>
            {blockType ? `${BLOCK_CONFIG[blockType]?.title} — ${currentQuestion}/${totalQuestions}` : `Question`}
          </div>

          {/* Last question banner */}
          {isLastQuestion && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'linear-gradient(135deg, #f97316, #ec4899)',
                borderRadius: '16px', padding: '12px 20px',
                marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px',
              }}
            >
              <Rocket size={18} color="#fff" />
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', textAlign: 'left', margin: 0 }}>
                Dernière question ! Elle va me permettre de créer les meilleures offres pour toi.
              </p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={questionId}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
            >
              {/* Title */}
              <h1 style={{
                fontSize: 'clamp(20px, 3.5vw, 28px)', fontWeight: 500,
                lineHeight: 1.3, letterSpacing: '-0.02em',
                color: '#1a1a1a', marginBottom: '10px',
              }}>
                {replaceVariables(title)}
              </h1>

              {subtitle && (
                <p style={{
                  fontSize: '14px', color: '#888', lineHeight: 1.6,
                  maxWidth: '420px', margin: '0 auto 28px',
                }}>
                  {replaceVariables(subtitle)}
                </p>
              )}

              {!subtitle && <div style={{ height: '16px' }} />}

              {/* Text input */}
              {inputType === 'textarea' && (
                <div style={{ textAlign: 'left' }}>
                  <div style={{ position: 'relative' }}>
                    <textarea
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={placeholder || "Ta réponse..."}
                      rows={4}
                      autoFocus
                      style={{
                        width: '100%', padding: '16px 20px', fontSize: '16px',
                        fontFamily: "'Inter', sans-serif", fontWeight: 400, color: '#1a1a1a',
                        background: '#f8f8f8', border: '1px solid #e5e5e5',
                        borderRadius: '20px', textAlign: 'left', outline: 'none',
                        resize: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                      }}
                      onFocus={(e) => { e.target.style.borderColor = '#1a1a1a'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.08)'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e5e5e5'; e.target.style.boxShadow = 'none'; }}
                    />
                    <div style={{ position: 'absolute', bottom: '12px', right: '12px' }}>
                      <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#999', padding: '4px',
                        }}
                      >
                        {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
                      </button>
                    </div>
                  </div>
                  {attachedFiles.length > 0 && (
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {attachedFiles.map((file, index) => (
                        <div key={index} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: '#f5f5f5', borderRadius: '12px', padding: '8px 12px',
                          border: '1px solid #e8e8e8',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Paperclip size={14} style={{ color: '#666' }} />
                            <span style={{ fontSize: '13px', color: '#555' }}>{file.name}</span>
                          </div>
                          <button onClick={() => removeFile(index)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={14} style={{ color: '#999' }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Radio */}
              {inputType === 'radio' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
                  {options.map((option, idx) => {
                    const optionLabel = typeof option === 'object' ? option.label : option;
                    const OptionIcon = typeof option === 'object' ? option.icon : null;
                    const isSelected = value === optionLabel;
                    return (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => {
                          setValue(optionLabel);
                          if (autoSubmit) setTimeout(() => handleNext(), 300);
                        }}
                        style={{
                          width: '100%', textAlign: 'left',
                          padding: '14px 20px', borderRadius: '100px',
                          border: isSelected ? '2px solid #1a1a1a' : '1px solid #e5e5e5',
                          background: isSelected ? '#f5f5f5' : '#fff',
                          fontSize: '15px', fontWeight: isSelected ? 600 : 400,
                          fontFamily: "'Inter', sans-serif", color: '#1a1a1a',
                          cursor: 'pointer', transition: 'all 0.2s',
                          display: 'flex', alignItems: 'center', gap: '12px',
                        }}
                      >
                        {OptionIcon && <OptionIcon size={18} style={{ color: '#666' }} />}
                        {optionLabel}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Checkbox */}
              {inputType === 'checkbox' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
                  {options.map((option, idx) => {
                    const isChecked = value.includes(option);
                    return (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => handleCheckboxChange(option, !isChecked)}
                        style={{
                          width: '100%', textAlign: 'left',
                          padding: '14px 20px', borderRadius: '16px',
                          border: isChecked ? '2px solid #1a1a1a' : '1px solid #e5e5e5',
                          background: isChecked ? '#f5f5f5' : '#fff',
                          fontSize: '15px', fontWeight: isChecked ? 600 : 400,
                          fontFamily: "'Inter', sans-serif", color: '#1a1a1a',
                          cursor: 'pointer', transition: 'all 0.2s',
                          display: 'flex', alignItems: 'center', gap: '12px',
                        }}
                      >
                        <div style={{
                          width: '20px', height: '20px', borderRadius: '6px',
                          border: isChecked ? '2px solid #1a1a1a' : '2px solid #ccc',
                          background: isChecked ? '#1a1a1a' : '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s', flexShrink: 0,
                        }}>
                          {isChecked && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        {option}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Slider */}
              {inputType === 'slider' && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <span style={{ fontSize: '52px', fontWeight: 700, letterSpacing: '-0.03em', color: '#1a1a1a' }}>
                      {value}
                    </span>
                    <span style={{ fontSize: '18px', color: '#bbb', marginLeft: '4px' }}>
                      {sliderConfig.suffix}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={sliderConfig.min}
                    max={sliderConfig.max}
                    step={sliderConfig.step}
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#1a1a1a' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#bbb', marginTop: '8px' }}>
                    <span>{sliderConfig.min}{sliderConfig.suffix}</span>
                    <span>{sliderConfig.max}{sliderConfig.suffix}</span>
                  </div>
                </div>
              )}

              {/* CTA */}
              <div style={{ marginTop: '32px', display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center' }}>
                {prevPage && (
                  <button
                    onClick={handleBack}
                    style={{
                      background: '#fff', border: '1px solid #e5e5e5',
                      borderRadius: '100px', padding: '14px 20px',
                      fontSize: '14px', fontWeight: 500, fontFamily: "'Inter', sans-serif",
                      color: '#888', cursor: 'pointer', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: '6px',
                    }}
                  >
                    <ArrowLeft size={16} /> Retour
                  </button>
                )}
                <div style={{
                  display: 'inline-flex', alignItems: 'center',
                  background: '#f8f8f8', borderRadius: '100px',
                  padding: '6px', border: '1px solid #e5e5e5',
                  flex: 1, maxWidth: prevPage ? '280px' : '360px',
                }}>
                  <button
                    onClick={handleNext}
                    disabled={isDisabled}
                    style={{
                      background: isLastQuestion
                        ? (isDisabled ? '#ccc' : 'linear-gradient(135deg, #f97316, #ec4899)')
                        : (isDisabled ? '#ccc' : '#1a1a1a'),
                      color: '#fff', border: 'none',
                      padding: '14px 28px', borderRadius: '100px',
                      fontSize: '15px', fontWeight: 600, fontFamily: "'Inter', sans-serif",
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '8px', transition: 'opacity 0.2s, background 0.2s',
                      width: '100%',
                    }}
                    onMouseOver={e => { if (!isDisabled) e.currentTarget.style.opacity = '0.85'; }}
                    onMouseOut={e => e.currentTarget.style.opacity = '1'}
                  >
                    {isSaving ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : isLastQuestion ? (
                      <><Rocket size={16} /> {buttonText} <ArrowRight size={16} /></>
                    ) : (
                      <>{buttonText} <ArrowRight size={16} /></>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .oqp-neon {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          filter: blur(60px);
          opacity: 0.5;
        }
        .oqp-neon-1 {
          width: min(280px, 55vw); height: min(280px, 55vw);
          background: radial-gradient(circle, rgba(249,115,22,0.5) 0%, transparent 70%);
          top: 8%; left: -8%;
          animation: oqpFloat1 7s ease-in-out infinite;
        }
        .oqp-neon-2 {
          width: min(220px, 45vw); height: min(220px, 45vw);
          background: radial-gradient(circle, rgba(236,72,153,0.45) 0%, transparent 70%);
          bottom: 15%; right: -5%;
          animation: oqpFloat2 8s ease-in-out infinite;
        }
        .oqp-neon-3 {
          width: min(200px, 42vw); height: min(200px, 42vw);
          background: radial-gradient(circle, rgba(167,139,250,0.45) 0%, transparent 70%);
          bottom: 5%; left: 10%;
          animation: oqpFloat3 9s ease-in-out infinite;
        }
        @keyframes oqpFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(18px, -12px) scale(1.06); }
        }
        @keyframes oqpFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-12px, 16px) scale(1.05); }
        }
        @keyframes oqpFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(14px, 10px) scale(1.08); }
        }
      `}</style>
    </div>
  );
}