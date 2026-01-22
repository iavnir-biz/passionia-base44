import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Sparkles, Mic, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import OnboardingSidebar from '@/components/onboarding/OnboardingSidebar';
import { cn } from "@/lib/utils";

const MAX_QUESTIONS = 11; // Nombre maximum de questions dans l'onboarding

export default function OnboardingDynamic() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [prefilledAnswer, setPrefilledAnswer] = useState(''); // 🔥 Passion pré-remplie
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    // 🔥 Récupérer la skill pré-remplie depuis Welcome
    const savedSkill = localStorage.getItem('prefilledSkill');
    if (savedSkill) {
      setPrefilledAnswer(savedSkill);
      localStorage.removeItem('prefilledSkill'); // Nettoyer après utilisation
      console.log('[OnboardingDynamic] Passion récupérée depuis localStorage:', savedSkill);
    }

    initializeOnboarding();
  }, []);


  // 🔥 Auto-remplir la première question si on a une passion pré-remplie
  useEffect(() => {
    if (currentQuestion?.number === 1 && prefilledAnswer && !value) {
      console.log('[OnboardingDynamic] Auto-remplissage de la Q1:', prefilledAnswer);
      setValue(prefilledAnswer);
    }
  }, [currentQuestion, prefilledAnswer]);

  const initializeOnboarding = async () => {
    try {
      const currentUser = await base44.auth.me();
      const realSessionId = currentUser.sessionId;

      if (!realSessionId) {
        navigate(createPageUrl('OnboardingFirstName'));
        return;
      }

      const sessions = await base44.entities.Session.filter({ id: realSessionId });
      if (!sessions || sessions.length === 0) {
        navigate(createPageUrl('OnboardingFirstName'));
        return;
      }

      const loadedSession = sessions[0];
      const firstName = localStorage.getItem('onboarding_firstName') || currentUser.firstName || '';

      setUser({ firstName });
      setSession(loadedSession);
      setQuestionCount(loadedSession.onboarding_history?.length || 0);

      // 🔥 Si la session a déjà une skill enregistrée et qu'on n'a pas encore de prefilledAnswer, l'utiliser
      if (loadedSession.onboarding_full?.coreSkill && !prefilledAnswer) {
        setPrefilledAnswer(loadedSession.onboarding_full.coreSkill);
        console.log('[OnboardingDynamic] Passion récupérée depuis Session:', loadedSession.onboarding_full.coreSkill);
      }

      if (loadedSession.is_onboarding_done) {
        navigate(createPageUrl('OnboardingTransition'));
        return;
      }

      await fetchNextQuestion(realSessionId, null);
    } catch (error) {
      console.error('Error initializing:', error);
      setIsLoading(false);
    }
  };

  const fetchNextQuestion = async (sessionId, lastAnswer = null) => {
    try {
      const firstName = localStorage.getItem('onboarding_firstName') || '';

      const { data } = await base44.functions.invoke('onboardingNextQuestion', {
        sessionId,
        userAnswer: lastAnswer,
        firstName
      });

      if (data.done || data.isDone) {
        await base44.entities.Session.update(sessionId, {
          is_onboarding_done: true
        });
        navigate(createPageUrl('OnboardingTransition'));
        return;
      }

      // Récupérer la session mise à jour
      const updatedSessions = await base44.entities.Session.filter({ id: sessionId });
      if (updatedSessions && updatedSessions.length > 0) {
        const freshSession = updatedSessions[0];
        setSession(freshSession);
        setQuestionCount(Math.min(freshSession.onboarding_history?.length || 0, MAX_QUESTIONS));
      }

      // Afficher la nouvelle question
      if (data.nextQuestion) {
        setCurrentQuestion(data.nextQuestion);
        initializeValue(data.nextQuestion.type, data.nextQuestion);
      }

    } catch (error) {
      console.error('Error fetching next question:', error);
      alert("Oups, j'ai rencontré un petit problème technique. Peux-tu rafraîchir la page ?");
    } finally {
      setIsLoading(false);
      setIsSaving(false);
    }
  };

  const initializeValue = (type, question = null) => {
    if (type === 'multiple_choice') setValue([]);
    else if (type === 'slider') setValue(question?.min || 0);
    else setValue('');
  };

  const handleNext = async () => {
    if (!canProceed()) return;
    setIsSaving(true);

    const normalizedAnswer = typeof value === 'string' ? value : JSON.stringify(value);
    
    await fetchNextQuestion(session.id, normalizedAnswer);
    
    setValue('');
  };

  const handleNextDirect = async (directValue) => {
    setIsSaving(true);
    await fetchNextQuestion(session.id, directValue);
    setValue('');
  };

  const canProceed = () => {
    if (!currentQuestion) return false;
    if (currentQuestion.type === 'multiple_choice') return value.length > 0;
    if (currentQuestion.type === 'slider') return true;
    if (currentQuestion.type === 'single_choice') return value !== '';
    return value && value.trim() !== '';
  };

  const handleCheckboxChange = (option, checked) => {
    if (checked) setValue([...value, option]);
    else setValue(value.filter(v => v !== option));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsTranscribing(true);
        try {
          const file = new File([audioBlob], 'voice.webm', { type: 'audio/webm' });
          const upload = await base44.integrations.Core.UploadFile({ file });
          const { data } = await base44.functions.invoke('transcribeAudio', { audioUrl: upload.file_url });
          setValue(prev => prev ? `${prev}\n${data.text}` : data.text);
        } catch (err) { 
          console.error('Transcription error:', err); 
        } finally { 
          setIsTranscribing(false); 
        }
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) { 
      console.error('Recording error:', err); 
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const progress = Math.min(((session?.onboarding_history?.length || 0) / MAX_QUESTIONS) * 100, 100);
  const completedSteps = (session?.onboarding_history?.length || 0) >= MAX_QUESTIONS ? [1] : [];

  return (
    <div className="min-h-screen bg-[#f9fafb] flex overflow-hidden">
      <OnboardingSidebar currentPage="OnboardingDynamic" completedSteps={completedSteps} progressInStep={progress} />

      <div className="flex-1 flex flex-col lg:ml-80 h-screen">
        {/* Header avec titre et progression */}
        <div className="bg-white border-b border-gray-100 px-6 py-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Tes talents</h1>
            <div className="text-right">
              <span className="text-sm font-medium text-[#61f7a2]">
                {questionCount}/{MAX_QUESTIONS} questions
              </span>
            </div>
          </div>
        </div>

        {/* Zone de contenu avec la question */}
        <div className="flex-1 overflow-y-auto flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-4xl">
            {isLoading && !currentQuestion ? (
              <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-[#61f7a2]" />
                  <p className="text-gray-500">Chargement de la question...</p>
                </div>
              </div>
            ) : currentQuestion && (
              <motion.div
                key={currentQuestion.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8 md:p-12"
              >
                {/* Icône Noah */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center shadow-sm">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Titre de la question */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {currentQuestion.title || currentQuestion.text}
                </h2>

                {/* Sous-titre */}
                {currentQuestion.subtitle && (
                  <p className="text-gray-500 text-base mb-8">
                    {currentQuestion.subtitle}
                  </p>
                )}

                {/* Badge dernière question */}
                {questionCount === MAX_QUESTIONS - 1 && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl flex gap-3">
                    <Sparkles className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-orange-800 leading-relaxed font-medium">
                      Dernière question ! N'hésite pas à être très précis, cela m'aidera à créer une offre qui te ressemble vraiment.
                    </p>
                  </div>
                )}

                {/* Champ de réponse selon le type */}
                <div className="space-y-6">
                  {currentQuestion.type === 'text' && (
                    <div className="relative">
                      <Textarea
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Je suis fleuriste, et j'aimerais apprendre aux gens à composer des superbes bouquets"
                        className="w-full bg-white border-gray-200 text-gray-900 min-h-[120px] text-base p-4 rounded-2xl focus:border-[#61f7a2] focus:ring-2 focus:ring-[#61f7a2]/20 transition-all resize-none"
                        autoFocus
                        disabled={isSaving}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey && canProceed()) {
                            e.preventDefault();
                            handleNext();
                          }
                        }}
                      />
                      <div className="absolute bottom-4 right-4">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "h-10 w-10 rounded-full transition-all",
                            isRecording ? "bg-red-50 text-red-500 animate-pulse" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                          )}
                          onClick={isRecording ? stopRecording : startRecording}
                          disabled={isTranscribing || isSaving}
                        >
                          {isTranscribing ? (
                            <Loader2 className="w-5 h-5 animate-spin text-[#61f7a2]" />
                          ) : isRecording ? (
                            <StopCircle className="w-5 h-5" />
                          ) : (
                            <Mic className="w-5 h-5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {currentQuestion.type === 'single_choice' && (
                    <div className="flex flex-col gap-3">
                      {(currentQuestion.options || []).map((option, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={cn(
                            "px-6 py-4 rounded-2xl text-base font-medium transition-all shadow-sm border text-left",
                            value === option
                              ? "bg-black text-white border-black"
                              : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                          )}
                          onClick={() => {
                            setValue(option);
                            handleNextDirect(option);
                          }}
                          disabled={isSaving}
                        >
                          {option}
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {currentQuestion.type === 'multiple_choice' && (
                    <div className="flex flex-col gap-3">
                      {(currentQuestion.options || []).map((option, idx) => (
                        <motion.button
                          key={idx}
                          onClick={() => handleCheckboxChange(option, !value.includes(option))}
                          className={cn(
                            "px-6 py-4 rounded-2xl text-base font-medium transition-all border shadow-sm flex items-center gap-3 text-left",
                            value.includes(option)
                              ? "bg-[#1a1a1a] text-white border-black"
                              : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                          )}
                          disabled={isSaving}
                        >
                          <Checkbox checked={value.includes(option)} className="border-white/20" />
                          {option}
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {currentQuestion.type === 'slider' && (
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-2xl p-6">
                        <div className="flex justify-between items-baseline mb-4">
                          <span className="text-gray-500 text-sm font-medium">Expérience</span>
                          <span className="text-4xl font-black text-gray-900">
                            {value >= (currentQuestion.max || 10) ? `${value}+` : value}
                            <span className="text-lg text-gray-400 ml-2">ans</span>
                          </span>
                        </div>
                        <Slider
                          value={[value]}
                          onValueChange={(vals) => setValue(vals[0])}
                          min={currentQuestion.min || 0}
                          max={currentQuestion.max || 10}
                          step={currentQuestion.step || 1}
                          disabled={isSaving}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  )}

                  {/* Bouton Continuer (pas pour single_choice car auto-submit) */}
                  {currentQuestion.type !== 'single_choice' && (
                    <button
                      onClick={handleNext}
                      disabled={!canProceed() || isSaving}
                      className={cn(
                        "w-full h-14 rounded-2xl text-base font-bold flex items-center justify-center gap-2 transition-all duration-300 mt-6",
                        "bg-[#61f7a2] text-gray-900 shadow-lg",
                        "hover:bg-[#4de88f] hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]",
                        (!canProceed() || isSaving) && "opacity-50 cursor-not-allowed shadow-none transform-none"
                      )}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Envoi en cours...</span>
                        </>
                      ) : (
                        <>
                          <span>Continuer</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}