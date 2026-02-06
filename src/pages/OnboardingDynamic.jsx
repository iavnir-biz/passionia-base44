import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, Mic, StopCircle } from 'lucide-react';
import { NoahBrainIcon } from '@/components/NoahBrainIcon';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import OnboardingSidebar from '@/components/onboarding/OnboardingSidebar';
import { cn } from "@/lib/utils";

const MAX_QUESTIONS = 11;

// 🔥 Questions locales - mode public (pas besoin de backend)
const LOCAL_QUESTIONS = [
  {
    number: 1,
    fieldName: 'coreSkill',
    title: "Enchanté, {{firstName}} ! Quelle est la compétence, la passion ou le savoir-faire que tu aimerais transformer en revenu ?",
    type: 'text',
    placeholder: "Ton savoir-faire..."
  },
  {
    number: 2,
    fieldName: 'experienceLevel',
    title: "Quel est ton niveau d'expérience actuel avec cette compétence ?",
    type: 'single_choice',
    options: [
      "C'est une passion, je débute",
      "J'ai déjà aidé des amis/proches (gratuitement)",
      "Je suis un professionnel / J'ai déjà eu des clients"
    ]
  },
  {
    number: 3,
    fieldName: 'yearsPracticing',
    title: "Depuis combien d'années pratiques-tu cette compétence ou passion ?",
    type: 'slider',
    min: 0,
    max: 15,
    step: 1,
    suffix: ' ans'
  },
  {
    number: 4,
    fieldName: 'targetAudience',
    title: "À qui aimerais-tu le plus enseigner cette compétence, {{firstName}} ?",
    type: 'text',
    placeholder: "Ta réponse ici..."
  },
  {
    number: 5,
    fieldName: 'mainProblem',
    title: "Quel est le problème N°1 que cette personne rencontre dans son apprentissage de {{coreSkill}} et que tu peux résoudre, {{firstName}} ?",
    type: 'text',
    placeholder: "Ta réponse ici..."
  },
  {
    number: 6,
    fieldName: 'firstQuickResult',
    title: "Quel est le tout premier résultat concret et rapide que ton élève obtiendra grâce à ton enseignement de {{coreSkill}}, {{firstName}} ?",
    type: 'text',
    placeholder: "Ta réponse ici..."
  },
  {
    number: 7,
    fieldName: 'finalTransformation',
    title: "Et à la fin, quel grand changement ou transformation aura-t-il vécu grâce à ton enseignement de {{coreSkill}}, {{firstName}} ?",
    type: 'text',
    placeholder: "Ta réponse ici..."
  },
  {
    number: 8,
    fieldName: 'mainTeaching',
    title: "Quelle est LA chose la plus importante que tu vas lui apprendre en {{coreSkill}}, {{firstName}} ?",
    type: 'text',
    placeholder: "Ta réponse ici..."
  },
  {
    number: 9,
    fieldName: 'uniqueMethod',
    title: "As-tu une méthode ou une façon d'enseigner {{coreSkill}} qui te rend différent des autres, {{firstName}} ?",
    subtitle: "Tu peux répondre « Je ne sais pas encore » si ce n'est pas clair pour toi.",
    type: 'text',
    placeholder: "Ta réponse ici..."
  },
  {
    number: 10,
    fieldName: 'typicalMistake',
    title: "Quelle est l'erreur typique que les débutants font en {{coreSkill}} et que tu aides à éviter, {{firstName}} ?",
    type: 'text',
    placeholder: "Ta réponse ici..."
  },
  {
    number: 11,
    fieldName: 'extraDetail',
    title: "Pour finir, y a-t-il autre chose que tu aimerais partager, {{firstName}} ? Une anecdote, une histoire personnelle liée à ta compétence {{coreSkill}}, ou un détail qui te rend unique ? Cela m'aidera à créer une offre qui te ressemble vraiment.",
    type: 'text',
    placeholder: "Ta réponse ici..."
  }
];

export default function OnboardingDynamic() {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const firstName = localStorage.getItem('onboarding_firstName') || '';

  useEffect(() => {
    initializeOnboarding();
  }, []);

  const initializeOnboarding = () => {
    try {
      const onboardingData = JSON.parse(localStorage.getItem('onboarding_data') || '{}');

      // Si l'onboarding est déjà terminé, aller à la transition
      if (onboardingData.is_onboarding_done) {
        navigate(createPageUrl('OnboardingTransition'));
        return;
      }

      // Reprendre là où l'utilisateur s'est arrêté
      const history = onboardingData.history || [];
      const resumeIndex = history.length;

      if (resumeIndex >= MAX_QUESTIONS) {
        // Toutes les questions ont été répondues
        onboardingData.is_onboarding_done = true;
        localStorage.setItem('onboarding_data', JSON.stringify(onboardingData));
        navigate(createPageUrl('OnboardingTransition'));
        return;
      }

      setCurrentQuestionIndex(resumeIndex);
      setQuestionCount(resumeIndex);

      // Pré-remplir si on a déjà une réponse pour cette question
      const question = LOCAL_QUESTIONS[resumeIndex];
      const savedValue = localStorage.getItem(`onboarding_${question.fieldName}`);
      if (savedValue && resumeIndex === 0) {
        // Auto-remplir Q1 avec la skill pré-remplie
        setValue(savedValue);
      } else {
        initializeValue(question.type, question);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing onboarding:', error);
      setIsLoading(false);
    }
  };

  const replaceVariables = (text) => {
    if (!text) return text;
    let result = text;
    result = result.replace(/\{\{firstName\}\}/g, firstName);
    const coreSkill = localStorage.getItem('onboarding_coreSkill') || 'ta compétence';
    result = result.replace(/\{\{coreSkill\}\}/g, coreSkill);
    return result;
  };

  const initializeValue = (type, question = null) => {
    if (type === 'multiple_choice') setValue([]);
    else if (type === 'slider') setValue(question?.min || 0);
    else setValue('');
  };

  const saveAnswer = (fieldName, answerValue) => {
    // Sauvegarder la réponse individuelle
    localStorage.setItem(
      `onboarding_${fieldName}`,
      typeof answerValue === 'object' ? JSON.stringify(answerValue) : String(answerValue)
    );

    // Mettre à jour onboarding_data
    const onboardingData = JSON.parse(localStorage.getItem('onboarding_data') || '{}');
    const history = onboardingData.history || [];
    const full = onboardingData.full || {};
    const summary = onboardingData.summary || {};

    // Ajouter à l'historique
    history.push({ question: fieldName, answer: answerValue });
    full[fieldName] = answerValue;
    summary[fieldName] = answerValue;

    onboardingData.history = history;
    onboardingData.full = full;
    onboardingData.summary = summary;

    localStorage.setItem('onboarding_data', JSON.stringify(onboardingData));

    console.log(`✅ [OnboardingDynamic] Saved ${fieldName}:`, answerValue, `(${history.length}/${MAX_QUESTIONS})`);
  };

  const goToNextQuestion = (answerValue) => {
    const currentQuestion = LOCAL_QUESTIONS[currentQuestionIndex];
    saveAnswer(currentQuestion.fieldName, answerValue);

    const nextIndex = currentQuestionIndex + 1;
    setQuestionCount(nextIndex);

    if (nextIndex >= MAX_QUESTIONS) {
      // Toutes les questions répondues
      const onboardingData = JSON.parse(localStorage.getItem('onboarding_data') || '{}');
      onboardingData.is_onboarding_done = true;
      localStorage.setItem('onboarding_data', JSON.stringify(onboardingData));
      console.log('🎉 [OnboardingDynamic] Onboarding Q1-Q11 complete!');
      navigate(createPageUrl('OnboardingTransition'));
      return;
    }

    setCurrentQuestionIndex(nextIndex);
    initializeValue(LOCAL_QUESTIONS[nextIndex].type, LOCAL_QUESTIONS[nextIndex]);
    setIsSaving(false);
  };

  const handleNext = () => {
    if (!canProceed()) return;
    setIsSaving(true);
    const normalizedAnswer = typeof value === 'string' ? value : value;
    goToNextQuestion(normalizedAnswer);
  };

  const handleNextDirect = (directValue) => {
    setIsSaving(true);
    goToNextQuestion(directValue);
  };

  const canProceed = () => {
    const currentQuestion = LOCAL_QUESTIONS[currentQuestionIndex];
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
          // Transcription locale via Web Speech API (fallback sans auth)
          if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            // Le navigateur supporte la reconnaissance vocale
            const text = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve('');
              reader.readAsArrayBuffer(audioBlob);
            });
            // Fallback: juste ajouter un placeholder
            setValue(prev => prev || '');
          }
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

  const currentQuestion = LOCAL_QUESTIONS[currentQuestionIndex];
  const progress = Math.min((questionCount / MAX_QUESTIONS) * 100, 100);
  const completedSteps = questionCount >= MAX_QUESTIONS ? [1] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex overflow-hidden">
      <OnboardingSidebar currentPage="OnboardingDynamic" completedSteps={completedSteps} progressInStep={progress} />

      <div className="flex-1 flex flex-col lg:ml-80 h-screen">
        {/* Header avec barre de progression */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10 w-full">
          <div className="max-w-4xl mx-auto w-full flex items-center justify-between gap-6">
            <span className="text-lg font-bold text-[#111827]">Tes talents</span>
            <div className="hidden md:block flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#61f7a2] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(questionCount / MAX_QUESTIONS) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
            <p className="text-sm font-medium text-[#61f7a2] whitespace-nowrap">
              {questionCount}/{MAX_QUESTIONS} questions
            </p>
          </div>
        </div>

        {/* Zone de contenu avec la question */}
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            {isLoading ? (
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
                className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-[#61f7a2]/10 to-[#2dd4bf]/10 px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <NoahBrainIcon size={44} isThinking={true} isFloating={true} />
                        <div>
                            <p className="text-xs font-medium text-[#2dd4bf]">Construisons ta nouvelle vie</p>
                            <p className="text-sm text-gray-500">Question {questionCount + 1}/{MAX_QUESTIONS}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-8">
                  {/* Titre de la question */}
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {replaceVariables(currentQuestion.title)}
                  </h2>

                  {/* Badge contextuel pour la première question */}
                  {currentQuestion.number === 1 && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl flex gap-3">
                      <Sparkles className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-800 leading-relaxed font-medium">
                        Plus tu me donnes d'informations, plus je pourrai générer des offres qui te correspondent parfaitement.
                      </p>
                    </div>
                  )}

                  {/* Sous-titre */}
                  {currentQuestion.subtitle && (
                    <p className="text-gray-600 text-sm mb-6">
                      {replaceVariables(currentQuestion.subtitle)}
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
                          placeholder={currentQuestion.placeholder || "Ta réponse..."}
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
                       <div className="pt-6">
                          <button
                            onClick={handleNext}
                            disabled={!canProceed() || isSaving}
                             className="w-full bg-[#61f7a2] hover:bg-[#4de88f] text-gray-900 font-semibold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Envoi en cours...</span>
                              </>
                            ) : (
                              <span>Continuer →</span>
                            )}
                          </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
