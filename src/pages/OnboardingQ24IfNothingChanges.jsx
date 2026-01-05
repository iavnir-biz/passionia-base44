import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OnboardingQ24IfNothingChanges() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const options = [
    "Exactement au même point, avec les mêmes frustrations",
    "Un peu découragé(e) de ne pas avoir essayé",
    "En train de chercher une autre idée, sans être passé(e) à l'action",
    "J'aurai probablement oublié cette idée"
  ];

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      if (currentUser.ifNothingChanges) {
        setValue(currentUser.ifNothingChanges);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = async (option) => {
    setValue(option);
    setIsSaving(true);
    
    try {
      await base44.auth.updateMe({ ifNothingChanges: option });
      
      if (user.sessionId) {
        const sessions = await base44.entities.Session.filter({ id: user.sessionId });
        if (sessions.length > 0) {
          const session = sessions[0];
          const onboardingFull = session.onboarding_full || {};
          onboardingFull.ifNothingChanges = option;
          await base44.entities.Session.update(user.sessionId, { onboarding_full: onboardingFull });
        }
      }
      
      setTimeout(() => {
        navigate(createPageUrl('OnboardingQ25Readiness'));
      }, 300);
    } catch (error) {
      console.error('Error saving:', error);
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    navigate(createPageUrl('OnboardingQ23Obstacles'));
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
        <div className="relative mb-8">
          <motion.div
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center shadow-lg"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <motion.div
            className="absolute -top-1 -right-1"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-5 h-5 text-[#61f7a2]" />
          </motion.div>
        </div>

        <div className="text-center mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Étape 2</h3>
          <p className="text-sm text-gray-600">Prise d'informations</p>
        </div>

        <div className="flex-1 flex flex-col items-center w-full max-w-[200px]">
          <div className="relative w-1 flex-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className="absolute top-0 left-0 right-0 bg-gradient-to-b from-[#61f7a2] to-[#4de88f]"
              initial={{ height: '0%' }}
              animate={{ height: '92%' }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="mt-4 text-center">
            <p className="text-2xl font-bold text-[#61f7a2]">92%</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <div className="w-full bg-gray-100 h-2 md:hidden">
          <div className="h-full bg-[#61f7a2] transition-all duration-500" style={{ width: '92%' }} />
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-3xl"
          >
            <motion.div 
              className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <motion.h1 
                className="text-2xl font-bold text-gray-900 mb-8 leading-relaxed text-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Si tu ne fais rien, où seras-tu dans 6 mois ?
              </motion.h1>

              {/* Grille 2x2 */}
              <motion.div 
                className="grid grid-cols-2 gap-4 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {options.map((option, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => !isSaving && handleSelect(option)}
                    disabled={isSaving}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`
                      relative p-6 rounded-2xl border-2 cursor-pointer transition-all shadow-sm
                      ${value === option 
                        ? 'bg-gradient-to-br from-green-50 to-blue-50 border-[#61f7a2] shadow-lg' 
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }
                      ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <p className="text-sm text-gray-900 font-medium text-left leading-relaxed">
                      {option}
                    </p>
                    {value === option && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-[#61f7a2] rounded-full flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </motion.div>

              {/* Bouton retour */}
              <motion.div 
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
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}