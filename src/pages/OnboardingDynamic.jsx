import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, Sparkles, Mic, StopCircle, Brain, Send, User as UserIcon, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import OnboardingSidebar from '@/components/onboarding/OnboardingSidebar';
import { cn } from "@/lib/utils";

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
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    initializeOnboarding();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const buildMessagesFromHistory = (history) => {
    const msgs = [];
    if (history && history.length > 0) {
      history.forEach((item, index) => {
        msgs.push({
          id: `q-${index}`,
          sender: 'noah',
          content: item.question
        });
        msgs.push({
          id: `a-${index}`,
          sender: 'user',
          content: item.answer
        });
      });
    }
    return msgs;
  };

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
      setMessages(buildMessagesFromHistory(loadedSession.onboarding_history || []));

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

      if (data.isDone) {
        await base44.entities.Session.update(sessionId, {
          is_onboarding_done: true,
          onboarding_summary: data.summary
        });
        navigate(createPageUrl('OnboardingTransition'));
      } else {
        setCurrentQuestion(data.question);
        initializeValue(data.question.type, data.question);

        const updatedSessions = await base44.entities.Session.filter({ id: sessionId });
        if (updatedSessions && updatedSessions.length > 0) {
          const freshSession = updatedSessions[0];
          setSession(freshSession);
          setQuestionCount(Math.min(freshSession.onboarding_history?.length || 0, 11));
          setMessages(buildMessagesFromHistory(freshSession.onboarding_history || []));
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
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
    setIsLoading(true);

    const normalizedAnswer = typeof value === 'string' ? value : JSON.stringify(value);
    await fetchNextQuestion(session.id, normalizedAnswer);

    setValue('');
    setIsSaving(false);
  };

  const handleNextDirect = async (directValue) => {
    setIsSaving(true);
    setIsLoading(true);
    await fetchNextQuestion(session.id, directValue);
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
        } catch (err) { console.error(err); }
        finally { setIsTranscribing(false); }
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) { console.error(err); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const progress = Math.min(((session?.onboarding_history?.length || 0) / 11) * 100, 100);
  const completedSteps = (session?.onboarding_history?.length || 0) >= 11 ? [1] : [];

  return (
    <div className="min-h-screen bg-[#f9fafb] flex overflow-hidden">
      <OnboardingSidebar currentPage="OnboardingDynamic" completedSteps={completedSteps} progressInStep={progress} />

      <div className="flex-1 flex flex-col lg:ml-80 h-screen relative">
        <div className="absolute top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-40">
          <div className="px-6 py-4 flex items-center justify-between max-w-4xl mx-auto w-full">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">Parcours de création</span>
              <span className="text-xs text-gray-500">Noah t'accompagne pas à pas</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-[#61f7a2] mb-1">
                {Math.min(session?.onboarding_history?.length || 0, 11)}/11
              </span>
              <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#61f7a2] to-[#4de88f]"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pt-24 pb-48 px-4 md:px-6">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-4 shadow-sm max-w-[85%]">
                <p className="text-gray-800 leading-relaxed text-sm md:text-base">
                  C'est un plaisir de t'aider à structurer ton projet ! Je vais te poser quelques questions pour comprendre ton univers.
                </p>
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} gap-4`}
                >
                  {msg.sender === 'noah' && (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[85%] p-4 shadow-sm text-sm md:text-base leading-relaxed whitespace-pre-line",
                    msg.sender === 'user'
                      ? "bg-gray-900 text-white rounded-2xl rounded-tr-none"
                      : "bg-white border border-gray-100 rounded-2xl rounded-tl-none text-gray-800"
                  )}>
                    {msg.content}
                  </div>
                  {msg.sender === 'user' && (
                    <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                      <UserIcon className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading ? (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-4 shadow-sm">
                  <div className="flex gap-1.5 py-1">
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 rounded-full bg-gray-300" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 rounded-full bg-gray-300" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 rounded-full bg-gray-300" />
                  </div>
                </div>
              </div>
            ) : currentQuestion && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center flex-shrink-0 shadow-sm mt-1 pulse-noah">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-4 max-w-[85%]">
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-5 shadow-sm">
                    <h3 className="text-gray-900 font-bold text-lg mb-2">
                      {currentQuestion.text || currentQuestion.title}
                    </h3>
                    {currentQuestion.subtitle && (
                      <p className="text-gray-600 text-sm leading-relaxed italic">
                        {currentQuestion.subtitle}
                      </p>
                    )}
                  </div>
                  {(session?.onboarding_history?.length || 0) === 10 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl rounded-tl-none flex gap-3 shadow-sm"
                    >
                      <Sparkles className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-orange-800 leading-relaxed font-medium">
                        C'est notre dernière étape ! N'hésite pas à être très précis, Noah adore les détails.
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-[#f9fafb] via-[#f9fafb] to-transparent z-40">
          <div className="max-w-3xl mx-auto">
            <motion.div layout className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
              <div className="p-4 md:p-6">
                {!isLoading && currentQuestion && (
                  <div className="space-y-4">
                    {currentQuestion.type === 'text' && (
                      <div className="relative group">
                        <Textarea
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                          placeholder="Écris ton message ici..."
                          className="w-full bg-gray-50 border-gray-200 text-gray-900 min-h-[80px] md:min-h-[100px] text-base p-4 rounded-2xl focus:border-[#61f7a2] focus:ring-[#61f7a2]/20 transition-all"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && canProceed()) {
                              e.preventDefault();
                              handleNext();
                            }
                          }}
                        />
                        <div className="absolute bottom-3 right-3 flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-10 w-10 rounded-full transition-all",
                              isRecording ? "bg-red-50 text-red-500 animate-pulse" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                            )}
                            onClick={isRecording ? stopRecording : startRecording}
                            disabled={isTranscribing}
                          >
                            {isTranscribing ? <Loader2 className="w-4 h-4 animate-spin text-[#61f7a2]" /> : isRecording ? <StopCircle className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    )}

                    {currentQuestion.type === 'single_choice' && (
                      <div className="flex flex-wrap gap-2">
                        {(currentQuestion.options || []).map((option, idx) => (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                              "px-5 py-3 rounded-2xl text-sm font-semibold transition-all shadow-sm border",
                              value === option
                                ? "bg-gray-900 text-white border-gray-900"
                                : "bg-white text-gray-700 border-gray-200 hover:border-black"
                            )}
                            onClick={() => {
                              setValue(option);
                              handleNextDirect(option);
                            }}
                          >
                            {option}
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {currentQuestion.type === 'multiple_choice' && (
                      <div className="flex flex-wrap gap-2">
                        {(currentQuestion.options || []).map((option, idx) => (
                          <motion.button
                            key={idx}
                            onClick={() => handleCheckboxChange(option, !value.includes(option))}
                            className={cn(
                              "px-5 py-3 rounded-2xl text-sm font-semibold transition-all border shadow-sm flex items-center gap-2",
                              value.includes(option)
                                ? "bg-gray-900 text-white border-gray-900"
                                : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                            )}
                          >
                            <Checkbox checked={value.includes(option)} className="border-white/20" />
                            {option}
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {currentQuestion.type === 'slider' && (
                      <div className="px-4 py-2 space-y-6">
                        <div className="flex justify-between items-end">
                          <span className="text-gray-400 text-sm font-medium">Expérience</span>
                          <span className="text-3xl font-black text-gray-900">
                            {value >= (currentQuestion.max || 10) ? `${value}+` : value} <span className="text-base text-gray-400">ans</span>
                          </span>
                        </div>
                        <Slider
                          value={[value]}
                          onValueChange={(vals) => setValue(vals[0])}
                          min={currentQuestion.min || 0}
                          max={currentQuestion.max || 10}
                          step={currentQuestion.step || 1}
                        />
                      </div>
                    )}

                    {currentQuestion.type !== 'single_choice' && (
                      <button
                        onClick={handleNext}
                        disabled={!canProceed() || isSaving}
                        className={cn(
                          "w-full h-14 rounded-2xl text-base font-bold flex items-center justify-center gap-2 transition-all duration-300",
                          "bg-gradient-to-br from-[#1a1a1a] to-black text-white shadow-lg",
                          "hover:shadow-[0_0_25px_rgba(97,247,162,0.5)] hover:border-[#61f7a2]/30 hover:-translate-y-0.5 active:scale-95",
                          (!canProceed() || isSaving) && "opacity-50 cursor-not-allowed shadow-none transform-none"
                        )}
                      >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Envoyer ma réponse <Send className="w-5 h-5" /></>}
                      </button>
                    )}
                  </div>
                )}
                {(isLoading || !currentQuestion) && (
                  <div className="h-20 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        .pulse-noah { animation: noahpulse 2s infinite; }
        @keyframes noahpulse {
          0% { box-shadow: 0 0 0 0px rgba(97, 247, 162, 0.4); }
          70% { box-shadow: 0 0 0 12px rgba(97, 247, 162, 0); }
          100% { box-shadow: 0 0 0 0px rgba(97, 247, 162, 0); }
        }
      `}} />
    </div>
  );
}