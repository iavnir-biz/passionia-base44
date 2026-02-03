import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles, Loader2, Paperclip, Mic, StopCircle, X, Brain } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import OnboardingSidebar from '@/components/onboarding/OnboardingSidebar';
import { NoahBrainIcon } from '@/components/NoahBrainIcon';

// Configuration des blocs pour la barre de progression
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
  blockType = null, // 'profile' ou 'objectives'
  useLocalStorage = false, // Pour les questions avant authentification
  customHandleSave = null, // Handler personnalisé pour Q26
  autoSubmit = false, // Pour auto-submit au clic (Q12, Q14, etc.)
  completedSteps = [] // Étapes complétées à afficher dans la sidebar
}) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [value, setValue] = useState(inputType === 'checkbox' ? [] : inputType === 'slider' ? sliderConfig.min : '');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const isSavingRef = useRef(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);

  // Calculer la progression dans le bloc actuel
  const blockProgress = blockType && BLOCK_CONFIG[blockType]
    ? ((BLOCK_CONFIG[blockType].pages.indexOf(window.location.pathname.split('/').pop()) + 1) / BLOCK_CONFIG[blockType].totalQuestions) * 100
    : progress;

  const blockTitle = blockType && BLOCK_CONFIG[blockType] ? BLOCK_CONFIG[blockType].title : '';
  const currentQuestion = blockType && BLOCK_CONFIG[blockType]
    ? BLOCK_CONFIG[blockType].pages.indexOf(window.location.pathname.split('/').pop()) + 1
    : 0;
  const totalQuestions = blockType && BLOCK_CONFIG[blockType] ? BLOCK_CONFIG[blockType].totalQuestions : 0;

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      if (useLocalStorage) {
        // Mode localStorage pour questions avant auth
        const onboardingData = JSON.parse(localStorage.getItem('onboarding_data') || '{}');
        const firstName = localStorage.getItem('onboarding_firstName') || '';
        const storedValue = localStorage.getItem(`onboarding_${fieldName}`);

        setUser({ firstName });
        if (storedValue) {
          setValue(inputType === 'checkbox' ? JSON.parse(storedValue) : storedValue);
        }
      } else {
        // Mode base44 classique
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

    // Pour les questions en mode localStorage
    if (useLocalStorage) {
      const targetIncome = localStorage.getItem('onboarding_targetIncome') || '';
      const targetIncomeDelay = localStorage.getItem('onboarding_targetIncomeDelay') || '';
      result = result
        .replace(/\{\{user\.targetIncome\}\}/g, targetIncome)
        .replace(/\{\{user\.targetIncomeDelay\}\}/g, targetIncomeDelay);
    }

    // Pour les questions authentifiées
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

    // 🔒 Anti-double-click
    if (isSavingRef.current) {
      console.warn('⚠️ Already saving, ignoring click');
      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);

    try {
      if (customHandleSave) {
        await customHandleSave(user, value);
        navigate(createPageUrl(nextPage));
        return;
      }

      if (useLocalStorage) {
        // 🔥 DOUBLE SAUVEGARDE : localStorage + Session.onboarding_full
        localStorage.setItem(`onboarding_${fieldName}`,
          inputType === 'checkbox' ? JSON.stringify(value) : value
        );

        // Sauvegarder en DB si l'utilisateur est authentifié
        try {
          const currentUser = await base44.auth.me();
          if (currentUser?.sessionId) {
            const response = await base44.functions.invoke('saveOnboardingAnswer', {
              sessionId: currentUser.sessionId,
              field: fieldName,
              value: inputType === 'checkbox' ? value : value
            });

            if (response.data?.success) {
              console.log('✅ [ONBOARDING_SAVE_LOCAL]', {
                sessionId: currentUser.sessionId,
                fieldName,
                saved: true
              });
            }
          }
        } catch (backendError) {
          console.warn('⚠️ [ONBOARDING_SAVE_LOCAL] Backend save failed:', backendError);
          // Continue anyway - localStorage is saved
        }

        navigate(createPageUrl(nextPage));
        return;
      }

      // Mode base44 - sauvegarder dans User
      await base44.auth.updateMe({ [fieldName]: value });

      // 🔥 BACKEND MERGE : appeler la fonction qui fait le merge server-side
      if (user.sessionId && fieldName) {
        try {
          const response = await base44.functions.invoke('saveOnboardingAnswer', {
            sessionId: user.sessionId,
            field: fieldName,
            value
          });

          if (response.data?.success) {
            console.log('✅ [ONBOARDING_SAVE]', {
              sessionId: user.sessionId,
              fieldName,
              saved: true,
              nextPage,
              totalKeys: Object.keys(response.data.onboarding_full || {}).length
            });
          } else {
            console.error('❌ [ONBOARDING_SAVE] Backend returned error:', response.data);
          }
        } catch (backendError) {
          console.error('❌ [ONBOARDING_SAVE] Backend call failed:', backendError);
          // Continue anyway - User data is saved
        }

        // Cas spécial Q26 : sync format_preferences dans summary
        if (fieldName === 'deliveryPreferences') {
          try {
            const sessions = await base44.entities.Session.filter({ id: user.sessionId });
            if (sessions.length > 0) {
              const session = sessions[0];
              await base44.asServiceRole.entities.Session.update(user.sessionId, {
                onboarding_summary: {
                  ...(session.onboarding_summary || {}),
                  format_preferences: value
                }
              });
            }
          } catch (e) {
            console.warn('⚠️ Could not sync format_preferences to summary:', e);
          }
        }
      }

      // Marquer onboarding_completed si on va vers OfferGenerationStart
      if (nextPage === 'OfferGenerationStart') {
        await base44.auth.updateMe({ onboarding_completed: true });
      }

      // 🚀 TOUJOURS naviguer après save
      navigate(createPageUrl(nextPage));

    } catch (error) {
      console.error('❌ [ONBOARDING_SAVE] Error:', error);
      alert('Erreur lors de la sauvegarde. Réessaye.');
    } finally {
      setIsSaving(false);
      isSavingRef.current = false;
    }
  };

  const handleBack = () => {
    if (prevPage) {
      navigate(createPageUrl(prevPage));
    }
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        setIsUploading(true);
        try {
          const file = new File([audioBlob], 'voice-note.webm', { type: 'audio/webm' });
          const { data } = await base44.integrations.Core.UploadFile({ file });
          setAttachedFiles([...attachedFiles, { name: 'Note vocale', url: data.file_url, isAudio: true }]);
        } catch (error) {
          console.error('Error uploading audio:', error);
        } finally {
          setIsUploading(false);
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
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
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 flex overflow-x-hidden">
      <OnboardingSidebar currentPage={window.location.pathname.split('/').pop()} completedSteps={completedSteps} />

      <div className="flex-1 w-full flex flex-col lg:ml-80 pt-20 lg:pt-0 overflow-x-hidden relative">
        <div className="flex-1 flex items-center justify-center p-3 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-2xl"
          >
            <motion.div
              className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Header avec Noah */}
                    <div className="bg-gradient-to-r from-[#61f7a2]/10 to-[#2dd4bf]/10 px-6 py-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <NoahBrainIcon size={44} isThinking={true} />
                        <div>
                          <p className="text-xs font-medium text-[#2dd4bf]">Noah te demande</p>
                          <p className="text-sm text-gray-500">Question {currentQuestion}/{totalQuestions}</p>
                        </div>
                      </div>
                    </div>

              {/* Body */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {replaceVariables(title)}
                </motion.h1>

              {subtitle && (
                <p className="text-gray-600 text-sm mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {replaceVariables(subtitle)}
                </motion.p>
              )}

              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {inputType === 'textarea' && (
                  <div className="space-y-3">
                    <div className="relative">
                      <Textarea
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Ta réponse..."
                        className="w-full border border-gray-200 rounded-xl p-4 min-h-[120px] focus:ring-2 focus:ring-[#61f7a2] focus:border-transparent"
                      />
                      <div className="absolute bottom-3 right-3 flex items-center gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Paperclip className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 hover:bg-gray-100 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:text-gray-700'}`}
                          onClick={isRecording ? stopRecording : startRecording}
                        >
                          {isRecording ? (
                            <StopCircle className="w-4 h-4" />
                          ) : (
                            <Mic className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {attachedFiles.length > 0 && (
                      <div className="space-y-2">
                        {attachedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-2 border border-gray-200">
                            <div className="flex items-center gap-2">
                              {file.isAudio ? <Mic className="w-4 h-4 text-gray-600" /> : <Paperclip className="w-4 h-4 text-gray-600" />}
                              <span className="text-sm text-gray-700">{file.name}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeFile(index)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {inputType === 'radio' && (
                  <RadioGroup value={typeof options[0] === 'object' ? value : value} onValueChange={(val) => {
                    setValue(val);
                    if (autoSubmit) {
                      setTimeout(() => handleNext(), 300);
                    }
                  }} className="space-y-3">
                    {options.map((option, idx) => {
                      const optionLabel = typeof option === 'object' ? option.label : option;
                      const OptionIcon = typeof option === 'object' ? option.icon : null;
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.1 }}
                          className={`flex items-center space-x-3 p-2.5 md:p-4 rounded-xl border cursor-pointer transition-all shadow-sm ${value === optionLabel
                            ? 'bg-gradient-to-br from-green-50 to-blue-50 border-[#61f7a2]'
                            : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md'
                            }`}
                          onClick={() => {
                            setValue(optionLabel);
                            if (autoSubmit) {
                              setTimeout(() => handleNext(), 300);
                            }
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <RadioGroupItem value={optionLabel} id={`option-${idx}`} />
                          {OptionIcon && <OptionIcon className="w-5 h-5 text-gray-600" />}
                          <Label htmlFor={`option-${idx}`} className="text-sm md:text-base text-gray-900 cursor-pointer flex-1 font-medium">
                            {optionLabel}
                          </Label>
                        </motion.div>
                      );
                    })}
                  </RadioGroup>
                )}

                {inputType === 'checkbox' && (
                  <div className="space-y-3">
                    {options.map((option, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.1 }}
                        className={`flex items-center space-x-3 p-2.5 md:p-4 rounded-xl border cursor-pointer transition-all shadow-sm ${value.includes(option)
                          ? 'bg-gradient-to-br from-green-50 to-blue-50 border-[#61f7a2]'
                          : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md'
                          }`}
                        onClick={() => handleCheckboxChange(option, !value.includes(option))}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Checkbox
                          checked={value.includes(option)}
                          onCheckedChange={(checked) => handleCheckboxChange(option, checked)}
                        />
                        <Label className="text-sm md:text-base text-gray-900 cursor-pointer flex-1 font-medium">{option}</Label>
                      </motion.div>
                    ))}
                  </div>
                )}

                {inputType === 'slider' && (
                  <div className="space-y-4 md:space-y-6">
                    <motion.div
                      className="text-center"
                      key={value}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-4xl md:text-5xl font-bold text-[#61f7a2]">
                        {value}{sliderConfig.suffix}
                      </span>
                    </motion.div>
                    <Slider
                      value={[value]}
                      onValueChange={(vals) => setValue(vals[0])}
                      min={sliderConfig.min}
                      max={sliderConfig.max}
                      step={sliderConfig.step}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600 font-medium">
                      <span>{sliderConfig.min}{sliderConfig.suffix}</span>
                      <span>{sliderConfig.max}{sliderConfig.suffix}</span>
                    </div>
                  </div>
                )}
              </motion.div>

                <motion.div
                  className="flex gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  {prevPage && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        onClick={handleBack}
                        className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300 h-10 md:h-11"
                      >
                        <ArrowLeft className="w-4 h-4 mr-1 md:mr-2" />
                        <span className="text-sm md:text-base">Retour</span>
                      </Button>
                    </motion.div>
                  )}
                  <div className="px-6 pb-6">
                        <GlowButton
                          onClick={handleNext}
                          disabled={!canProceed()}
                          loading={isSaving}
                          className="w-full"
                        >
                          {buttonText}
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </GlowButton>
                      </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}