import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { NoahBrainIcon } from '@/components/NoahBrainIcon';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

const MAX_QUESTIONS = 11;

const useTypingEffect = (text, speed = 30, delay = 0) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;
    setDisplayedText('');
    setIsComplete(false);

    const timeout = setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return { displayedText, isComplete };
};

export default function OnboardingFirstName() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth, navigateToLogin } = useAuth();

  // Phase: 'intro' | 'questions'
  const [phase, setPhase] = useState('intro');
  const [firstName, setFirstName] = useState('');
  const [isSubmittingName, setIsSubmittingName] = useState(false);

  // Questions phase
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [value, setValue] = useState('');
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      navigateToLogin();
    }
  }, [isLoadingAuth, isAuthenticated, navigateToLogin]);

  // Typing effects for intro
  const text1 = "Commençons par faire connaissance 🙂";
  const text2 = "Je suis Noah, l'IA de Passion IA.\nJe vais t'aider à transformer ce que tu sais déjà — en une activité en ligne claire et monétisable.";
  const text3 = "En quelques minutes, on va poser les bases de ton projet et construire un plan d'action adapté à toi.";
  const text4 = "On commence simplement, quel est ton prénom ? 👇";

  const typing1 = useTypingEffect(text1, 30, 500);
  const typing2 = useTypingEffect(text2, 20, 2000);
  const typing3 = useTypingEffect(text3, 20, typing2.isComplete ? 500 : 999999);
  const typing4 = useTypingEffect(text4, 30, typing3.isComplete ? 500 : 999999);

  // ─── Session management ───────────────────────────────────────────────────

  const createOrReuseSession = async (currentUser, sessionData) => {
    const existingSessions = await base44.entities.Session.filter({
      created_by: currentUser.email
    });

    if (existingSessions.length > 0) {
      const sessionId = existingSessions[0].id;
      await base44.entities.Session.update(sessionId, {
        ...sessionData,
        session_number: existingSessions[0].session_number || 1,
        session_name: existingSessions[0].session_name || 'Session 1'
      });
      return sessionId;
    } else {
      const session = await base44.entities.Session.create({
        ...sessionData,
        session_number: 1,
        session_name: 'Session 1',
        is_regenerating: false,
        regeneration_count: 0
      });
      return session.id;
    }
  };

  const handleSubmitName = async () => {
    if (!firstName.trim()) return;
    setIsSubmittingName(true);

    try {
      localStorage.setItem('onboarding_firstName', firstName.trim());
      const prefilledSkill = localStorage.getItem('prefilledSkill');

      const currentUser = await base44.auth.me();
      const sessionData = {
        onboarding_history: [],
        onboarding_summary: prefilledSkill ? { who_to_teach: prefilledSkill } : {},
        onboarding_full: prefilledSkill ? { coreSkill: prefilledSkill } : {},
        skill: prefilledSkill || '',
        is_onboarding_done: false
      };

      let sessionId;
      const regeneratingSessionId = localStorage.getItem('regenerating_session_id');
      const activeSessionId = localStorage.getItem('passionia_active_session_id');

      if (regeneratingSessionId) {
        sessionId = regeneratingSessionId;
        await base44.entities.Session.update(sessionId, sessionData);
      } else if (activeSessionId) {
        const existing = await base44.entities.Session.filter({ id: activeSessionId });
        if (existing.length > 0) {
          sessionId = activeSessionId;
          await base44.entities.Session.update(sessionId, sessionData);
        } else {
          sessionId = await createOrReuseSession(currentUser, sessionData);
        }
      } else {
        sessionId = await createOrReuseSession(currentUser, sessionData);
      }

      await base44.auth.updateMe({
        firstName: firstName.trim(),
        sessionId,
        coreSkill: prefilledSkill || ''
      });
      localStorage.setItem('passionia_active_session_id', sessionId);

      // Load session then fetch first question
      const sessions = await base44.entities.Session.filter({ id: sessionId });
      setSession(sessions[0]);
      setPhase('questions');
      setIsLoadingQuestion(true);
      await fetchNextQuestion(sessionId, null, prefilledSkill);
    } catch (error) {
      console.error('Error saving firstName:', error);
      alert('Une erreur est survenue. Merci de réessayer.');
    } finally {
      setIsSubmittingName(false);
    }
  };

  // ─── Question fetching ────────────────────────────────────────────────────

  const fetchNextQuestion = async (sessionId, lastAnswer = null, prefilledSkill = null) => {
    try {
      const fn = localStorage.getItem('onboarding_firstName') || '';
      const payload = { sessionId, firstName: fn };
      if (lastAnswer !== null) payload.userAnswer = lastAnswer;

      const { data } = await base44.functions.invoke('onboardingNextQuestion', payload);

      if (data.error) throw new Error(data.error);

      if (data.done || data.isDone) {
        await base44.entities.Session.update(sessionId, { is_onboarding_done: true });
        navigate(createPageUrl('OnboardingTransition'));
        return;
      }

      const updatedSessions = await base44.entities.Session.filter({ id: sessionId });
      if (updatedSessions?.length > 0) {
        setSession(updatedSessions[0]);
        setQuestionCount(Math.min(updatedSessions[0].onboarding_history?.length || 0, MAX_QUESTIONS));
      }

      if (data.nextQuestion) {
        setCurrentQuestion(data.nextQuestion);
        initializeValue(data.nextQuestion.type, data.nextQuestion);

        // Auto-fill Q1 if we have a prefilled skill
        if (data.nextQuestion.number === 1 && prefilledSkill) {
          setValue(prefilledSkill);
        }
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      toast.error("Oups, une erreur est survenue. Réessaie.");
    } finally {
      setIsLoadingQuestion(false);
      setIsSaving(false);
    }
  };

  const initializeValue = (type, question = null) => {
    if (type === 'multiple_choice') setValue([]);
    else if (type === 'slider') setValue(question?.min || 0);
    else setValue('');
  };

  const canProceed = () => {
    if (!currentQuestion) return false;
    if (currentQuestion.type === 'multiple_choice') return value.length > 0;
    if (currentQuestion.type === 'slider') return true;
    if (currentQuestion.type === 'single_choice') return value !== '';
    return value && value.trim() !== '';
  };

  const handleNext = async () => {
    if (!canProceed()) return;
    setIsSaving(true);
    const normalized = typeof value === 'string' ? value : JSON.stringify(value);
    await fetchNextQuestion(session.id, normalized);
    setValue('');
  };

  const handleNextDirect = async (directValue) => {
    setIsSaving(true);
    await fetchNextQuestion(session.id, directValue);
    setValue('');
  };

  const handleCheckboxChange = (option, checked) => {
    if (checked) setValue([...value, option]);
    else setValue(value.filter(v => v !== option));
  };

  const progress = Math.min((questionCount / MAX_QUESTIONS) * 100, 100);

  // ─── Loading state ────────────────────────────────────────────────────────

  if (isLoadingAuth || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#61f7a2]" />
      </div>
    );
  }

  // ─── Phase 0 : Intro + first name ─────────────────────────────────────────

  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative flex items-center justify-center mb-8"
          >
            <NoahBrainIcon size={96} isThinking={true} />
          </motion.div>

          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm min-h-[500px]">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-relaxed min-h-[2.5rem]">
              {typing1.displayedText}
              {!typing1.isComplete && <span className="animate-pulse">|</span>}
            </h1>

            {typing1.isComplete && (
              <div className="text-gray-700 mb-6 leading-relaxed whitespace-pre-line min-h-[6rem]">
                Je suis <span className="text-[#61f7a2] font-semibold">Noah</span>, l'IA de Passion IA.
                <br />
                {typing2.displayedText.split('\n').slice(1).join('\n')}
                {!typing2.isComplete && <span className="animate-pulse">|</span>}
              </div>
            )}

            {typing2.isComplete && (
              <div className="text-gray-700 mb-6 leading-relaxed whitespace-pre-line min-h-[5rem]">
                {typing3.displayedText}
                {!typing3.isComplete && <span className="animate-pulse">|</span>}
              </div>
            )}

            {typing3.isComplete && (
              <div className="text-gray-700 mb-6 leading-relaxed min-h-[2rem]">
                {typing4.displayedText}
                {!typing4.isComplete && <span className="animate-pulse">|</span>}
              </div>
            )}

            {typing4.isComplete && (
              <>
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter' && firstName.trim()) handleSubmitName(); }}
                  placeholder="Ton prénom"
                  className="w-full bg-white border-gray-300 text-gray-900 text-lg py-6 px-4 rounded-2xl focus:border-[#61f7a2] focus:ring-[#61f7a2] placeholder:text-gray-400"
                  autoFocus
                />
                <div className="mt-8">
                  <GlowButton
                    onClick={handleSubmitName}
                    disabled={!firstName.trim()}
                    loading={isSubmittingName}
                    className="w-full"
                    size="lg"
                  >
                    Prêt à démarrer
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </GlowButton>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Phase 1 : Dynamic questions ──────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex flex-col">
      {/* Progress header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-xl mx-auto flex items-center gap-4">
          <NoahBrainIcon size={36} isThinking={true} />
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#61f7a2] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
          <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
            {questionCount}/{MAX_QUESTIONS}
          </span>
        </div>
      </div>

      {/* Question content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-xl">
          {isLoadingQuestion && !currentQuestion ? (
            <div className="flex flex-col items-center gap-4 py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#61f7a2]" />
              <p className="text-gray-500">Chargement de la question...</p>
            </div>
          ) : currentQuestion && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {currentQuestion.title || currentQuestion.text}
                </h2>

                {currentQuestion.subtitle && (
                  <p className="text-gray-500 text-sm mb-6">{currentQuestion.subtitle}</p>
                )}

                {questionCount === MAX_QUESTIONS - 1 && (
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                    <Sparkles className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-orange-800 font-medium">
                      Dernière question ! Sois précis, ça m'aide à créer une offre qui te ressemble vraiment.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {currentQuestion.type === 'text' && (
                    <Textarea
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="Ta réponse..."
                      className="w-full border border-gray-200 rounded-xl p-4 min-h-[120px] focus:ring-2 focus:ring-[#61f7a2] focus:border-transparent"
                      autoFocus
                      disabled={isSaving}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && canProceed()) {
                          e.preventDefault();
                          handleNext();
                        }
                      }}
                    />
                  )}

                  {currentQuestion.type === 'single_choice' && (
                    <div className="flex flex-col gap-3">
                      {(currentQuestion.options || []).map((option, idx) => (
                        <button
                          key={idx}
                          className={cn(
                            "px-5 py-4 rounded-xl text-base font-medium transition-all border text-left",
                            value === option
                              ? "bg-black text-white border-black"
                              : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                          )}
                          onClick={() => { setValue(option); handleNextDirect(option); }}
                          disabled={isSaving}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {currentQuestion.type === 'multiple_choice' && (
                    <div className="flex flex-col gap-3">
                      {(currentQuestion.options || []).map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleCheckboxChange(option, !value.includes(option))}
                          className={cn(
                            "px-5 py-4 rounded-xl text-base font-medium transition-all border flex items-center gap-3 text-left",
                            value.includes(option)
                              ? "bg-[#1a1a1a] text-white border-black"
                              : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                          )}
                          disabled={isSaving}
                        >
                          <Checkbox checked={value.includes(option)} className="border-white/20" />
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {currentQuestion.type === 'slider' && (
                    <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                      <div className="flex justify-between items-baseline">
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
                      />
                    </div>
                  )}

                  {currentQuestion.type !== 'single_choice' && (
                    <button
                      onClick={handleNext}
                      disabled={!canProceed() || isSaving}
                      className="w-full bg-[#61f7a2] hover:bg-[#4de88f] text-gray-900 font-semibold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                    >
                      {isSaving ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /><span>Envoi en cours...</span></>
                      ) : (
                        <span>Continuer →</span>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}
