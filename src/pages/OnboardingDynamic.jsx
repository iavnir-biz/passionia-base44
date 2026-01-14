import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, Sparkles, Mic, StopCircle, Brain, Send, User as UserIcon } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import OnboardingSidebar from '@/components/onboarding/OnboardingSidebar';

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
  const [audioURL, setAudioURL] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    initializeOnboarding();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Build messages from session history
  const buildMessagesFromHistory = (history) => {
    const msgs = [];
    if (history && history.length > 0) {
      history.forEach((item, index) => {
        // Noah's question
        msgs.push({
          id: `q-${index}`,
          type: 'question',
          sender: 'noah',
          content: item.question,
          questionType: item.questionType || 'text'
        });
        // User's answer
        msgs.push({
          id: `a-${index}`,
          type: 'answer',
          sender: 'user',
          content: item.answer
        });
      });
    }
    return msgs;
  };


  const initializeOnboarding = async () => {
    try {
      // 1️⃣ RÉCUPÉRER LE SESSION ID DEPUIS LE USER
      const currentUser = await base44.auth.me();
      const realSessionId = currentUser.sessionId;

      if (!realSessionId) {
        console.error('❌ [OnboardingDynamic] Pas de sessionId sur User → redirect');
        navigate(createPageUrl('OnboardingFirstName'));
        return;
      }

      console.log('✅ [OnboardingDynamic] SessionId récupéré:', realSessionId);

      // 2️⃣ CHARGER LA SESSION DEPUIS BASE44
      const sessions = await base44.entities.Session.filter({ id: realSessionId });
      if (!sessions || sessions.length === 0) {
        console.error('❌ [OnboardingDynamic] Session inexistante en base');
        navigate(createPageUrl('OnboardingFirstName'));
        return;
      }

      const loadedSession = sessions[0];
      const firstName = localStorage.getItem('onboarding_firstName') || currentUser.firstName || '';

      setUser({ full_name: firstName, firstName: firstName });
      setSession(loadedSession);

      const history = loadedSession.onboarding_history || [];
      setQuestionCount(Math.min(history.length, 11));

      // Build message history for chat display
      const historicalMessages = buildMessagesFromHistory(history);
      setMessages(historicalMessages);

      console.log('📊 [OnboardingDynamic] Session chargée:', {
        sessionId: loadedSession.id,
        historyLength: history.length,
        messagesCount: historicalMessages.length,
        isDone: loadedSession.is_onboarding_done
      });

      // Si déjà terminé, rediriger
      if (loadedSession.is_onboarding_done) {
        console.log('✅ [OnboardingDynamic] Onboarding déjà terminé → redirect Transition');
        navigate(createPageUrl('OnboardingTransition'));
        return;
      }

      // 3️⃣ CHARGER LA PROCHAINE QUESTION
      await fetchNextQuestion(realSessionId, null);
    } catch (error) {
      console.error('❌ [OnboardingDynamic] Error initializing:', error);
      setIsLoading(false);
    }
  };

  const fetchNextQuestion = async (sessionId, lastAnswer = null) => {
    try {
      const firstName = localStorage.getItem('onboarding_firstName') || '';

      console.log('📤 [fetchNextQuestion] Appel backend:', {
        sessionId,
        hasAnswer: !!lastAnswer,
        answerPreview: lastAnswer ? lastAnswer.substring(0, 50) : 'N/A'
      });

      // 🔥 DB-FIRST : Le backend charge tout depuis la DB
      const { data } = await base44.functions.invoke('onboardingNextQuestion', {
        sessionId,
        userAnswer: lastAnswer,
        firstName
      });

      console.log('📨 [fetchNextQuestion] Réponse API:', {
        isDone: data.isDone,
        hasQuestion: !!data.question,
        questionType: data.question?.type,
        summaryUpdated: !!data.summary,
        debug: data._debug
      });

      if (data.isDone) {
        // 3️⃣ MARQUER LA SESSION COMME TERMINÉE
        await base44.entities.Session.update(sessionId, {
          is_onboarding_done: true,
          onboarding_summary: data.summary || summary
        });

        console.log('✅ [fetchNextQuestion] Onboarding marqué terminé');
        navigate(createPageUrl('OnboardingTransition'));
      } else {
        // 4️⃣ AFFICHER LA PROCHAINE QUESTION
        setCurrentQuestion(data.question);
        initializeValue(data.question.type, data.question);

        // Recharger la session pour avoir l'historique à jour
        const updatedSessions = await base44.entities.Session.filter({ id: sessionId });
        if (updatedSessions && updatedSessions.length > 0) {
          setSession(updatedSessions[0]);
          setQuestionCount(Math.min(updatedSessions[0].onboarding_history?.length || 0, 11));
        }
      }
    } catch (error) {
      console.error('❌ [fetchNextQuestion] Error:', error);
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
    setIsLoading(true);

    // 🔥 NORMALISER LA RÉPONSE EN STRING
    const normalizedAnswer = typeof value === 'string'
      ? value
      : JSON.stringify(value);

    console.log('📤 [handleNext] Envoi réponse:', {
      type: currentQuestion?.type,
      originalType: typeof value,
      normalizedLength: normalizedAnswer.length
    });

    await fetchNextQuestion(session.id, normalizedAnswer);

    // Reset typé selon le prochain type de question
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
    if (checked) {
      setValue([...value, option]);
    } else {
      setValue(value.filter(v => v !== option));
    }
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

        // Transcrire l'audio
        setIsTranscribing(true);
        try {
          // Upload l'audio d'abord
          const file = new File([audioBlob], 'voice-note.webm', { type: 'audio/webm' });
          const uploadResult = await base44.integrations.Core.UploadFile({ file });

          // Puis transcrire
          const { data } = await base44.functions.invoke('transcribeAudio', {
            audioUrl: uploadResult.file_url
          });

          // Ajouter le texte transcrit à la réponse existante
          setValue(prev => prev ? `${prev}\n${data.text}` : data.text);
        } catch (error) {
          console.error('Error transcribing audio:', error);
        } finally {
          setIsTranscribing(false);
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

  const LoadingAnimation = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      {/* Cerveau animé */}
      <div className="relative w-32 h-32 mx-auto mb-6">
        {/* Cerveau principal */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-full bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center shadow-lg"
          style={{
            boxShadow: '0 0 40px rgba(97, 247, 162, 0.4)'
          }}
        >
          <Brain className="w-16 h-16 text-white" />
        </motion.div>

        {/* Particules orbitales */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0"
          >
            <div
              className="absolute w-3 h-3 rounded-full bg-[#61f7a2]"
              style={{
                top: '50%',
                left: '100%',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 10px rgba(97, 247, 162, 0.6)'
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Texte animé */}
      <motion.div
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Noah réfléchit à ta prochaine question...
        </h3>
        <p className="text-gray-600 text-sm">
          Analyse de tes réponses en cours
        </p>
      </motion.div>

      {/* Points de chargement */}
      <div className="flex justify-center gap-2 mt-6">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
            className="w-2 h-2 rounded-full bg-[#61f7a2]"
          />
        ))}
      </div>
    </motion.div>
  );

  // Étape 1 : 0-100% (11 questions)
  const progress = Math.min(((session?.onboarding_history?.length || 0) / 11) * 100, 100);
  const completedSteps = [];
  const historyLength = session?.onboarding_history?.length || 0;
  if (historyLength >= 11) completedSteps.push(1);
  const progressInStep = historyLength < 11 ? progress : 0;

  return (
    <div className="min-h-screen bg-[#f9fafb] flex overflow-hidden">
      <OnboardingSidebar currentPage="OnboardingDynamic" completedSteps={completedSteps} progressInStep={progressInStep} />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-80 h-screen relative">
        {/* Header / Progress */}
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

        {/* Messaging Area */}
        <div className="flex-1 overflow-y-auto pt-24 pb-48 px-4 md:px-6">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Welcome Message (Static) */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-4 shadow-sm max-w-[85%]">
                <p className="text-gray-800 leading-relaxed">
                  C'est un plaisir de t'aider à structurer ton projet ! Je vais te poser quelques questions pour comprendre ton univers.
                </p>
              </div>
            </div>

            {/* History Messages */}
            <AnimatePresence mode="popLayout">
              {messages.map((msg, i) => (
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

            {/* Current Question or Loading */}
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

                  {/* Tip Badge for last question */}
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

        {/* Sticky Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-[#f9fafb] via-[#f9fafb] to-transparent z-40">
          <div className="max-w-3xl mx-auto">
            <motion.div
              layout
              className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden"
            >
              {/* Contextual Input Rendering */}
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
                                ? "bg-gray-900 text-white border-gray-900 shadow-md"
                                : "bg-white text-gray-700 border-gray-200 hover:border-gray-900 hover:bg-gray-50"
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
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                              "px-5 py-3 rounded-2xl text-sm font-semibold transition-all border shadow-sm",
                              value.includes(option)
                                ? "bg-[#eefdf5] text-[#166534] border-[#61f7a2]"
                                : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                            )}
                          >
                            <Checkbox
                              checked={value.includes(option)}
                              className="mr-2 border-gray-300 data-[state=checked]:bg-[#61f7a2] data-[state=checked]:border-[#61f7a2]"
                            />
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

                    {/* Main Action Blue Button (Only for text/multi/slider) */}
                    {(currentQuestion.type !== 'single_choice') && (
                      <GlowButton
                        onClick={handleNext}
                        disabled={!canProceed() || isSaving}
                        loading={isSaving}
                        className="w-full h-14 rounded-2xl text-base font-bold"
                      >
                        Envoyer ma réponse
                        <Send className="w-5 h-5 ml-2" />
                      </GlowButton>
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

            <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-black">
              Session d'onboarding avec Noah AI
            </p>
          </div>
        </div>
      </div>

      {/* Styles localisés pour Noah */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .pulse-noah {
          animation: noah-shadow-pulse 2s infinite;
        }
        @keyframes noah-shadow-pulse {
          0% { box-shadow: 0 0 0 0px rgba(97, 247, 162, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(97, 247, 162, 0); }
          100% { box-shadow: 0 0 0 0px rgba(97, 247, 162, 0); }
        }
      `}} />
    </div>
  );
}