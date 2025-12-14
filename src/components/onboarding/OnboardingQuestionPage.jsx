import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
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
    setIsLoadingHelper(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Tu es le DynamicQuestionCoach pour Passion IA.

Objectif : aider l'utilisateur à clarifier sa compétence afin de la MONÉTISER en la transmettant à d'autres (élèves, clients, communauté). Toute ta logique doit tourner autour de : enseigner, aider, résoudre un problème, structurer une offre, créer un programme.

IMPORTANT : L'utilisateur MAÎTRISE déjà sa compétence. Il veut la TRANSMETTRE et en vivre. Ne parle JAMAIS comme s'il voulait l'apprendre lui-même.

Données utilisateur :
- Prénom : ${user.firstName || 'non renseigné'}
- Compétence à transmettre : ${user.coreSkill || 'non renseignée'}
- Niveau d'expérience : ${user.experienceLevel || 'non renseigné'}
- Années de pratique : ${user.yearsPracticing || 'non renseigné'}
- Public cible (élèves) : ${user.targetAudience || 'non renseigné'}
- Problème principal des élèves : ${user.mainProblem || 'non renseigné'}
- Revenu cible : ${user.targetIncome || 'non renseigné'}€/mois

Question actuelle (questionId) : ${questionId}

Génère un JSON avec :
- helperText : une phrase d'aide courte, motivante, orientée transmission/monétisation
- examples : 2-3 exemples concrets personnalisés à la compétence ${user.coreSkill || ''}

Règles :
- Tu tutoies.
- Utilise le prénom et la compétence dès que possible.
- Personnalise TOUS les exemples avec la compétence user.coreSkill si elle existe.
- Toujours raisonner en logique de transmission : "tes élèves", "les personnes que tu veux aider", "ton audience", "ta communauté".
- Ne JAMAIS proposer des conseils pour apprendre la compétence soi-même.
- Ton ton : coach, expert, bienveillant, clair, motivant.
- Si user.coreSkill n'existe pas encore, reste neutre et générique.`,
        response_json_schema: {
          type: "object",
          properties: {
            helperText: { type: "string" },
            examples: { type: "array", items: { type: "string" } }
          }
        }
      });
      
      if (result.helperText) setHelperText(result.helperText);
      if (result.examples) setExamples(result.examples);
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
      await base44.auth.updateMe({ [fieldName]: value });
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
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full bg-gray-100 h-2">
        <div 
          className="h-full bg-[#61f7a2] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-center py-2 text-sm text-gray-600 font-medium">
        {progress}%
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-2xl"
        >
          {/* Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm"
          >
            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-relaxed">
              {replaceVariables(title)}
            </h1>

            {/* Subtitle (static) */}
            {subtitle && (
              <p className="text-gray-600 mb-4">{replaceVariables(subtitle)}</p>
            )}

            {/* Dynamic helper text */}
            {isLoadingHelper ? (
              <div className="flex items-center gap-2 text-gray-500 mb-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Personnalisation en cours...</span>
              </div>
            ) : helperText && (
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-4 mb-4 border border-green-100">
                <p className="text-[#61f7a2] text-sm flex items-start gap-2">
                  <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{helperText}</span>
                </p>
              </div>
            )}

            {/* Examples */}
            {examples.length > 0 && (
              <p className="text-gray-500 text-sm mb-6 italic">
                Ex : {examples.join(' • ')}
              </p>
            )}

            {/* Input */}
            <div className="mb-8">
              {inputType === 'textarea' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <Textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-white border-gray-300 text-gray-900 min-h-[120px] text-lg p-4 rounded-2xl focus:border-[#61f7a2] focus:ring-[#61f7a2] placeholder:text-gray-400 transition-all duration-300 hover:shadow-md"
                  />
                </motion.div>
              )}

              {inputType === 'radio' && (
                <RadioGroup value={value} onValueChange={setValue} className="space-y-3">
                  {options.map((option, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + idx * 0.1 }}
                      className={`flex items-center space-x-3 p-4 rounded-2xl border cursor-pointer transition-all shadow-sm hover:scale-[1.02] ${
                        value === option 
                          ? 'bg-gradient-to-br from-green-50 to-blue-50 border-[#61f7a2]' 
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
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

              {inputType === 'checkbox' && (
                <div className="space-y-3">
                  {options.map((option, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + idx * 0.1 }}
                      className={`flex items-center space-x-3 p-4 rounded-2xl border cursor-pointer transition-all shadow-sm hover:scale-[1.02] ${
                        value.includes(option)
                          ? 'bg-gradient-to-br from-green-50 to-blue-50 border-[#61f7a2]'
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
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

              {inputType === 'slider' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <motion.span 
                      key={value}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="text-5xl font-bold text-[#61f7a2]"
                    >
                      {value}{sliderConfig.suffix}
                    </motion.span>
                  </div>
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
                </motion.div>
              )}
            </div>

            {/* Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="flex gap-4"
            >
              {prevPage && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300 hover:scale-105"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              )}
              <GlowButton
                onClick={handleNext}
                disabled={!canProceed()}
                loading={isSaving}
                className="flex-1"
                size="lg"
              >
                {buttonText}
                <ArrowRight className="w-5 h-5 ml-2" />
              </GlowButton>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}