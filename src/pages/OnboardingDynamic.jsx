import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Sparkles, Paperclip, Mic, StopCircle, X } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export default function OnboardingDynamic() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    initializeOnboarding();
  }, []);

  const initializeOnboarding = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Chercher ou créer une session
      const sessions = await base44.entities.Session.filter({ 
        created_by: currentUser.email 
      });
      
      let activeSession;
      if (sessions.length > 0) {
        activeSession = sessions[0];
      } else {
        activeSession = await base44.entities.Session.create({
          onboarding_history: [],
          onboarding_summary: {},
          current_question: null,
          is_onboarding_done: false
        });
      }

      setSession(activeSession);
      const history = activeSession.onboarding_history || [];
      
      // Calculer le vrai nombre de questions basé sur les 11 questions actuelles
      setQuestionCount(Math.min(history.length, 11) + 1);

      // Si pas de question courante, demander la première
      if (!activeSession.current_question) {
        await fetchNextQuestion(activeSession.id);
      } else {
        setCurrentQuestion(activeSession.current_question);
        initializeValue(activeSession.current_question.type, activeSession.current_question);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error initializing onboarding:', error);
      setIsLoading(false);
    }
  };

  const fetchNextQuestion = async (sessionId, lastAnswer = null) => {
    try {
      const { data } = await base44.functions.invoke('onboardingNextQuestion', {
        sessionId,
        userAnswer: lastAnswer
      });

      if (data.isDone) {
        // Sauvegarder coreSkill sur le user avant de passer aux questions statiques
        const sessions = await base44.entities.Session.filter({ id: sessionId });
        if (sessions.length > 0) {
          const finalSession = sessions[0];
          const summary = finalSession.onboarding_summary || {};
          await base44.auth.updateMe({ 
            coreSkill: summary.who_to_teach || finalSession.skill || ''
          });
        }
        // Passer à l'écran de transition
        navigate(createPageUrl('OnboardingTransition'));
      } else {
        setCurrentQuestion(data.question);
        initializeValue(data.question.type, data.question);
        // Incrémenter seulement si on n'a pas dépassé 11
        setQuestionCount(prev => Math.min(prev + 1, 11));
      }
    } catch (error) {
      console.error('Error fetching next question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeValue = (type, question = null) => {
    if (type === 'multiple_choice') {
      setValue([]);
    } else if (type === 'slider') {
      setValue(question?.min || 0);
    } else {
      setValue('');
    }
  };

  const handleNext = async () => {
    if (!canProceed()) return;
    
    setIsSaving(true);
    await fetchNextQuestion(session.id, value);
    setValue('');
    setIsSaving(false);
  };

  const canProceed = () => {
    if (!currentQuestion) return false;
    if (currentQuestion.type === 'multiple_choice') return value.length > 0;
    if (currentQuestion.type === 'slider') return true;
    if (currentQuestion.type === 'single_choice') return value !== '';
    return value && value.trim() !== '';
  };

  const handleCheckboxChange = (option, checked) => {
    if (checked) {
      setValue([...value, option]);
    } else {
      setValue(value.filter(v => v !== option));
    }
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

  if (isLoading || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin" />
      </div>
    );
  }

  const progress = Math.min((questionCount / 11) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full bg-gray-100 h-2">
        <div 
          className="h-full bg-[#61f7a2] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-center py-2 text-sm text-gray-600 font-medium">
        Question {questionCount}
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
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
            {/* Question */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-start gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#61f7a2] mt-1 flex-shrink-0" />
                <h1 className="text-2xl font-bold text-gray-900 leading-relaxed">
                  {currentQuestion.title || currentQuestion.text}
                </h1>
              </div>
              {currentQuestion.subtitle && (
                <p className="text-gray-600 mb-6 ml-7 text-sm">
                  {currentQuestion.subtitle}
                </p>
              )}
            </motion.div>

            {/* Input */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {currentQuestion.type === 'text' && (
                <div className="space-y-3">
                  <div className="relative">
                    <Textarea
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="Ta réponse..."
                      className="w-full bg-white border-gray-300 text-gray-900 min-h-[120px] text-lg p-4 rounded-2xl focus:border-[#61f7a2] focus:ring-[#61f7a2]"
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

              {currentQuestion.type === 'single_choice' && (
                <RadioGroup value={value} onValueChange={setValue} className="space-y-3">
                  {(currentQuestion.options || []).map((option, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      className={`flex items-center space-x-3 p-4 rounded-2xl border cursor-pointer transition-all shadow-sm ${
                        value === option 
                          ? 'bg-gradient-to-br from-green-50 to-blue-50 border-[#61f7a2]' 
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setValue(option)}
                    >
                      <RadioGroupItem value={option} id={`option-${idx}`} />
                      <Label htmlFor={`option-${idx}`} className="text-gray-900 cursor-pointer flex-1 font-medium">
                        {option}
                      </Label>
                    </motion.div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion.type === 'multiple_choice' && (
                <div className="space-y-3">
                  {(currentQuestion.options || []).map((option, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      className={`flex items-center space-x-3 p-4 rounded-2xl border cursor-pointer transition-all shadow-sm ${
                        value.includes(option)
                          ? 'bg-gradient-to-br from-green-50 to-blue-50 border-[#61f7a2]'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleCheckboxChange(option, !value.includes(option))}
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

              {currentQuestion.type === 'slider' && (
                <div className="space-y-6">
                  <motion.div 
                    className="text-center"
                    key={value}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-5xl font-bold text-[#61f7a2]">
                      {value}
                    </span>
                  </motion.div>
                  <Slider
                    value={[value]}
                    onValueChange={(vals) => setValue(vals[0])}
                    min={currentQuestion.min || 0}
                    max={currentQuestion.max || 10}
                    step={currentQuestion.step || 1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 font-medium">
                    <span>{currentQuestion.min || 0}</span>
                    <span>{currentQuestion.max || 10}</span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <GlowButton
                onClick={handleNext}
                disabled={!canProceed()}
                loading={isSaving}
                className="w-full"
                size="lg"
              >
                Continuer
                <ArrowRight className="w-5 h-5 ml-2" />
              </GlowButton>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}