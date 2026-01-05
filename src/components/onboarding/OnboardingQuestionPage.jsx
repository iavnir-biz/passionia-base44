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

export default function OnboardingQuestionPage({
  questionId,
  title,
  subtitle,
  inputType = 'textarea', // 'textarea', 'radio', 'checkbox', 'slider'
  options = [],
  sliderConfig = { min: 0, max: 10, step: 1, suffix: '' },
  placeholder = '',
  fieldName,
  nextPage,
  prevPage,
  progress,
  buttonText = 'Continuer'
}) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [value, setValue] = useState(inputType === 'checkbox' ? [] : inputType === 'slider' ? sliderConfig.min : '');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [helperText, setHelperText] = useState('');
  const [examples, setExamples] = useState([]);
  const [isLoadingHelper, setIsLoadingHelper] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user && questionId) {
      loadDynamicHelper();
    }
  }, [user, questionId]);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Pre-fill value if exists
      if (currentUser[fieldName] !== undefined && currentUser[fieldName] !== null) {
        setValue(currentUser[fieldName]);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDynamicHelper = async () => {
    if (!user.sessionId) return;
    
    setIsLoadingHelper(true);
    try {
      const { data } = await base44.functions.invoke('onboardingHelper', {
        sessionId: user.sessionId,
        questionId,
        fieldName
      });
      
      if (data.helperText) {
        setHelperText(data.helperText);
      }
      if (data.examples && data.examples.length > 0) {
        setExamples(data.examples);
      }
    } catch (error) {
      console.error('Error loading helper:', error);
    } finally {
      setIsLoadingHelper(false);
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
      // Sauvegarder sur le user
      await base44.auth.updateMe({ [fieldName]: value });
      
      // Si c'est la dernière question (Q26), sauvegarder aussi onboarding_completed
      if (nextPage === 'OfferGenerationStart') {
        // Mapper vers Session.onboarding_full pour sauvegarder toutes les données statiques
        if (user.sessionId) {
          const sessions = await base44.entities.Session.filter({ id: user.sessionId });
          if (sessions.length > 0) {
            const session = sessions[0];
            const onboardingFull = session.onboarding_full || {};
            const summary = session.onboarding_summary || {};
            
            // Sauvegarder la dernière réponse
            onboardingFull[fieldName] = value;
            
            // Mapper deliveryPreferences vers format_preferences dans le summary
            if (fieldName === 'deliveryPreferences') {
              summary.format_preferences = value;
            }
            
            await base44.entities.Session.update(user.sessionId, { 
              onboarding_full: onboardingFull,
              onboarding_summary: summary
            });
          }
        }
        
        // Sauvegarder les données principales sur le user
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
        // Questions intermédiaires : sauvegarder dans onboarding_full
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
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);

        // Upload audio
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
      {/* Sidebar gauche */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col items-center py-12 px-6">
        {/* Noah Avatar */}
        <div className="relative mb-8">
          <motion.div
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center shadow-lg"
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <motion.div
            className="absolute -top-1 -right-1"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Sparkles className="w-5 h-5 text-[#61f7a2]" />
          </motion.div>
        </div>

        {/* Étape */}
        <div className="text-center mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Étape 2</h3>
          <p className="text-sm text-gray-600">Prise d'informations</p>
        </div>

        {/* Progress vertical */}
        <div className="flex-1 flex flex-col items-center w-full max-w-[200px]">
          <div className="relative w-1 flex-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className="absolute top-0 left-0 right-0 bg-gradient-to-b from-[#61f7a2] to-[#4de88f]"
              initial={{ height: '0%' }}
              animate={{ height: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="mt-4 text-center">
            <p className="text-2xl font-bold text-[#61f7a2]">{Math.round(progress)}%</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Progress bar horizontal (mobile) */}
        <div className="w-full bg-gray-100 h-2 md:hidden">
          <div 
            className="h-full bg-[#61f7a2] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-2xl"
        >
          {/* Card */}
          <motion.div 
            className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Title */}
            <motion.h1 
              className="text-2xl font-bold text-gray-900 mb-4 leading-relaxed"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {replaceVariables(title)}
            </motion.h1>

            {/* Subtitle (static) */}
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

            {/* Helper IA avec mémoire */}
            {isLoadingHelper && (
              <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>L'IA analyse ton parcours...</span>
              </div>
            )}

            {helperText && !isLoadingHelper && (
              <motion.div 
                className="mb-4 p-4 bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-2xl"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-sm text-gray-700 mb-2">💡 {helperText}</p>
                {examples.length > 0 && (
                  <div className="space-y-1 mt-2">
                    <p className="text-xs text-gray-500 font-semibold">Exemples :</p>
                    {examples.map((ex, idx) => (
                      <p key={idx} className="text-xs text-gray-600">• {ex}</p>
                    ))}
                  </div>
                )}
              </motion.div>
            )}



            {/* Input */}
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

                  {/* Attached files */}
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
                  // Auto-submit après sélection
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

            {/* Buttons */}
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