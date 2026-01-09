import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Sparkles, Mic, StopCircle, Brain } from 'lucide-react';
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
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    initializeOnboarding();
  }, []);

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

      console.log('📊 [OnboardingDynamic] Session chargée:', {
        sessionId: loadedSession.id,
        historyLength: history.length,
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

  // Calculer les étapes complétées basées sur la progression
  const completedSteps = [];
  const historyLength = session?.onboarding_history?.length || 0;
  if (historyLength >= 11) completedSteps.push(1); // Tes talents
  
  // Calculer la progression dans l'étape actuelle (pour la ligne verte)
  const progressInStep = historyLength < 11 ? progress : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex">
      <OnboardingSidebar currentPage="OnboardingDynamic" completedSteps={completedSteps} progressInStep={progressInStep} />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-80 pt-32 lg:pt-0">
        {/* Progress bar for current block */}
        <div className="fixed top-0 lg:top-0 left-0 lg:left-80 right-0 bg-white border-b border-gray-200 z-40 pt-20 lg:pt-0">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Tes talents</span>
              <span className="text-sm font-semibold text-[#61f7a2]">
                {Math.min(session?.onboarding_history?.length || 0, 11)}/11 questions
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#61f7a2] to-[#4de88f]"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 mt-24 lg:mt-20">
        {(isLoading || !currentQuestion) ? (
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
              <LoadingAnimation />
            </div>
          </div>
        ) : (
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
                  {currentQuestion.text || currentQuestion.title}
                </h1>
              </div>
              {currentQuestion.subtitle && (
                <p className="text-gray-600 mb-6 ml-7 text-sm">
                  {currentQuestion.subtitle}
                </p>
              )}
              
              {/* Badge spécial pour la question 11 (dernière question) */}
              {(session?.onboarding_history?.length || 0) === 10 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="ml-7 mb-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">💡</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 font-medium mb-1">
                        <strong>Astuce de Noah :</strong>
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Plus tu me donnes de contexte, plus je pourrai créer des offres personnalisées et un univers cohérent pour toi. N'hésite pas à détailler !
                      </p>
                    </div>
                  </div>
                </motion.div>
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
                    <div className="absolute bottom-3 right-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 hover:bg-gray-100 ${isRecording ? 'text-red-500 animate-pulse' : isTranscribing ? 'text-[#61f7a2]' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isTranscribing}
                      >
                        {isTranscribing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isRecording ? (
                          <StopCircle className="w-4 h-4" />
                        ) : (
                          <Mic className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {currentQuestion.type === 'single_choice' && (
                <RadioGroup value={value} onValueChange={async (val) => {
                  setValue(val);
                  // 🔥 FIX RACE CONDITION : envoyer directement la valeur sélectionnée
                  setIsSaving(true);
                  setIsLoading(true);
                  await fetchNextQuestion(session.id, val);
                  setIsSaving(false);
                }} className="space-y-3">
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
                      onClick={async () => {
                        setValue(option);
                        // 🔥 FIX RACE CONDITION : envoyer directement
                        setIsSaving(true);
                        setIsLoading(true);
                        await fetchNextQuestion(session.id, option);
                        setIsSaving(false);
                      }}
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
                      {value >= (currentQuestion.max || 10) ? `${value}+` : value} {value === 1 ? 'AN' : 'ANS'}
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
                    <span>{currentQuestion.min || 0} {(currentQuestion.min || 0) === 1 ? 'AN' : 'ANS'}</span>
                    <span>{currentQuestion.max || 10}+ ANS</span>
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
        )}
        </div>
      </div>
    </div>
  );
}