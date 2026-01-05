import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function OnboardingQ17TargetDelay() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [value, setValue] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [realisticChoice, setRealisticChoice] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      if (currentUser.targetIncomeDelay) {
        setValue(currentUser.targetIncomeDelay);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    const income = user.targetIncome || 0;
    
    // Garde-fou : >= 10 000€ en <= 3 mois
    if (income >= 10000 && value <= 3) {
      setShowWarning(true);
      return;
    }

    await saveAndContinue(value);
  };

  const saveAndContinue = async (delay) => {
    setIsSaving(true);
    try {
      await base44.auth.updateMe({ targetIncomeDelay: delay });
      
      if (user.sessionId) {
        const sessions = await base44.entities.Session.filter({ id: user.sessionId });
        if (sessions.length > 0) {
          const session = sessions[0];
          const onboardingFull = session.onboarding_full || {};
          onboardingFull.targetIncomeDelay = delay;
          await base44.entities.Session.update(user.sessionId, { onboarding_full: onboardingFull });
        }
      }
      
      navigate(createPageUrl('OnboardingQ18LifeChange'));
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRealisticChoice = async () => {
    if (!realisticChoice) return;
    
    const newIncome = realisticChoice === 'option1' ? 3000 : 5000;
    setShowWarning(false);
    
    // Sauvegarder le nouveau revenu cible ET le délai
    setIsSaving(true);
    try {
      await base44.auth.updateMe({ 
        targetIncome: newIncome,
        targetIncomeDelay: value 
      });
      
      if (user.sessionId) {
        const sessions = await base44.entities.Session.filter({ id: user.sessionId });
        if (sessions.length > 0) {
          const session = sessions[0];
          const onboardingFull = session.onboarding_full || {};
          onboardingFull.targetIncome = newIncome;
          onboardingFull.targetIncomeDelay = value;
          await base44.entities.Session.update(user.sessionId, { onboarding_full: onboardingFull });
        }
      }
      
      navigate(createPageUrl('OnboardingQ18LifeChange'));
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    navigate(createPageUrl('OnboardingQ16TargetIncome'));
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
            <motion.div
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
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
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
              animate={{ height: '42%' }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="mt-4 text-center">
            <p className="text-2xl font-bold text-[#61f7a2]">42%</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Progress bar horizontal (mobile) */}
        <div className="w-full bg-gray-100 h-2 md:hidden">
          <div 
            className="h-full bg-[#61f7a2] transition-all duration-500"
            style={{ width: '42%' }}
          />
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
            {!showWarning ? (
              <>
                <motion.h1 
                  className="text-2xl font-bold text-gray-900 mb-4 leading-relaxed"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  D'ici combien de mois aimerais-tu atteindre ce revenu ?
                </motion.h1>

                <motion.div 
                  className="mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="space-y-6">
                    <motion.div 
                      className="text-center"
                      key={value}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-5xl font-bold text-[#61f7a2]">
                        {value} {value === 1 ? 'mois' : 'mois'}
                      </span>
                    </motion.div>
                    <Slider
                      value={[value]}
                      onValueChange={(vals) => setValue(vals[0])}
                      min={1}
                      max={12}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600 font-medium">
                      <span>1 mois</span>
                      <span>12 mois</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
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
                  <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <GlowButton
                      onClick={handleNext}
                      loading={isSaving}
                      className="w-full"
                      size="lg"
                    >
                      Continuer
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </GlowButton>
                  </motion.div>
                </motion.div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  Objectif peu réaliste
                </h2>

                <p className="text-gray-600 mb-6 text-center">
                  Atteindre {user.targetIncome}€ par mois en {value} mois n'est pas réaliste pour un premier lancement. Choisis un objectif plus atteignable pour démarrer :
                </p>

                <RadioGroup value={realisticChoice} onValueChange={setRealisticChoice} className="space-y-3 mb-6">
                  <motion.div
                    className={`flex items-center space-x-3 p-4 rounded-2xl border cursor-pointer transition-all shadow-sm ${
                      realisticChoice === 'option1' 
                        ? 'bg-gradient-to-br from-green-50 to-blue-50 border-[#61f7a2]' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setRealisticChoice('option1')}
                  >
                    <RadioGroupItem value="option1" id="option1" />
                    <Label htmlFor="option1" className="text-gray-900 cursor-pointer flex-1 font-medium">
                      3 000€ par mois (objectif solide pour commencer)
                    </Label>
                  </motion.div>

                  <motion.div
                    className={`flex items-center space-x-3 p-4 rounded-2xl border cursor-pointer transition-all shadow-sm ${
                      realisticChoice === 'option2' 
                        ? 'bg-gradient-to-br from-green-50 to-blue-50 border-[#61f7a2]' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setRealisticChoice('option2')}
                  >
                    <RadioGroupItem value="option2" id="option2" />
                    <Label htmlFor="option2" className="text-gray-900 cursor-pointer flex-1 font-medium">
                      5 000€ par mois (ambitieux mais atteignable)
                    </Label>
                  </motion.div>
                </RadioGroup>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowWarning(false)}
                    className="flex-1"
                  >
                    Retour
                  </Button>
                  <GlowButton
                    onClick={handleRealisticChoice}
                    disabled={!realisticChoice}
                    loading={isSaving}
                    className="flex-1"
                  >
                    Valider mon choix
                  </GlowButton>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
        </div>
      </div>
    </div>
  );
}