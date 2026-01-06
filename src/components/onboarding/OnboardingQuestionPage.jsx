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
  customHandleSave = null // Handler personnalisé pour Q26
}) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [value, setValue] = useState(inputType === 'checkbox' ? [] : inputType === 'slider' ? sliderConfig.min : '');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
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
    if (!text || !user) return text;
    return text
      .replace(/\{\{user\.firstName\}\}/g, user.firstName || '')
      .replace(/\{\{user\.coreSkill\}\}/g, user.coreSkill || '')
      .replace(/\{\{user\.targetIncome\}\}/g, user.targetIncome || '')
      .replace(/\{\{user\.targetIncomeDelay\}\}/g, user.targetIncomeDelay || '');
  };

  const handleNext = async () => {
    if (!canProceed()) return;
    
    setIsSaving(true);
    try {
      if (customHandleSave) {
        // Handler personnalisé (pour Q26)
        await customHandleSave(user, value);
        navigate(createPageUrl(nextPage));
      } else if (useLocalStorage) {
        // Mode localStorage
        localStorage.setItem(`onboarding_${fieldName}`, 
          inputType === 'checkbox' ? JSON.stringify(value) : value
        );
        navigate(createPageUrl(nextPage));
      } else {
        // Mode base44 classique
        await base44.auth.updateMe({ [fieldName]: value });
        
        if (nextPage === 'OfferGenerationStart') {
          if (user.sessionId) {
            const sessions = await base44.entities.Session.filter({ id: user.sessionId });
            if (sessions.length > 0) {
              const session = sessions[0];
              const onboardingFull = session.onboarding_full || {};
              const summary = session.onboarding_summary || {};
              
              onboardingFull[fieldName] = value;
              
              if (fieldName === 'deliveryPreferences') {
                summary.format_preferences = value;
              }
              
              await base44.entities.Session.update(user.sessionId, { 
                onboarding_full: onboardingFull,
                onboarding_summary: summary
              });
            }
          }
          
          const currentUser = await base44.auth.me();
          await base44.auth.updateMe({ 
            onboarding_completed: true,
            targetAudience: currentUser.targetAudience || '',
            mainProblem: currentUser.mainProblem || '',
            firstResult: currentUser.firstResult || '',
            finalTransformation: currentUser.finalTransformation || '',
            uniqueMethod: currentUser.uniqueMethod || '',
            typicalMistake: currentUser.typicalMistake || '',
            extraDetail: currentUser.extraDetail || '',
            deliveryPreferences: currentUser.deliveryPreferences || []
          });
        } else {
          if (user.sessionId) {
            const sessions = await base44.entities.Session.filter({ id: user.sessionId });
            if (sessions.length > 0) {
              const session = sessions[0];
              const onboardingFull = session.onboarding_full || {};
              onboardingFull[fieldName] = value;
              await base44.entities.Session.update(user.sessionId, { onboarding_full: onboardingFull });
            }
          }
        }
        
        navigate(createPageUrl(nextPage));
      }
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
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
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex">
      <OnboardingSidebar currentPage={window.location.pathname.split('/').pop()} completedSteps={[]} />

      <div className="flex-1 flex flex-col lg:ml-80 pt-32 lg:pt-0">
        {/* Progress bar for current block */}
        {blockType && (
          <div className="fixed top-0 lg:top-0 left-0 lg:left-80 right-0 bg-white border-b border-gray-200 z-40 pt-20 lg:pt-0">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{blockTitle}</span>
                <span className="text-sm font-semibold text-[#61f7a2]">
                  {currentQuestion}/{totalQuestions} questions
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#61f7a2] to-[#4de88f]"
                  initial={{ width: '0%' }}
                  animate={{ width: `${blockProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        )}

        <div className={`flex-1 flex items-center justify-center p-6 ${blockType ? 'mt-24 lg:mt-20' : ''}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-2xl"
          >
            <motion.div 
              className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <motion.h1 
                className="text-2xl font-bold text-gray-900 mb-4 leading-relaxed"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {replaceVariables(title)}
              </motion.h1>

              {subtitle && (
                <motion.p 
                  className="text-gray-600 mb-4"
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
                        placeholder={placeholder}
                        className="w-full bg-white border-gray-300 text-gray-900 min-h-[120px] text-lg p-4 rounded-2xl focus:border-[#61f7a2] focus:ring-[#61f7a2] placeholder:text-gray-400 transition-all duration-300"
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
                  <RadioGroup value={value} onValueChange={(val) => {
                    setValue(val);
                    setTimeout(() => handleNext(), 300);
                  }} className="space-y-3">
                    {options.map((option, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.1 }}
                        className={`flex items-center space-x-3 p-4 rounded-2xl border cursor-pointer transition-all shadow-sm ${
                          value === option 
                            ? 'bg-gradient-to-br from-green-50 to-blue-50 border-[#61f7a2]' 
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }`}
                        onClick={() => {
                          setValue(option);
                          setTimeout(() => handleNext(), 300);
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <RadioGroupItem value={option} id={`option-${idx}`} />
                        <Label htmlFor={`option-${idx}`} className="text-gray-900 cursor-pointer flex-1 font-medium">
                          {option}
                        </Label>
                      </motion.div>
                    ))}
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
                        className={`flex items-center space-x-3 p-4 rounded-2xl border cursor-pointer transition-all shadow-sm ${
                          value.includes(option)
                            ? 'bg-gradient-to-br from-green-50 to-blue-50 border-[#61f7a2]'
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }`}
                        onClick={() => handleCheckboxChange(option, !value.includes(option))}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Checkbox
                          checked={value.includes(option)}
                          onCheckedChange={(checked) => handleCheckboxChange(option, checked)}
                        />
                        <Label className="text-gray-900 cursor-pointer flex-1 font-medium">{option}</Label>
                      </motion.div>
                    ))}
                  </div>
                )}

                {inputType === 'slider' && (
                  <div className="space-y-6">
                    <motion.div 
                      className="text-center"
                      key={value}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-5xl font-bold text-[#61f7a2]">
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
                      className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Retour
                    </Button>
                  </motion.div>
                )}
                <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <GlowButton
                    onClick={handleNext}
                    disabled={!canProceed()}
                    loading={isSaving}
                    className="w-full"
                    size="lg"
                  >
                    {buttonText}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </GlowButton>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}