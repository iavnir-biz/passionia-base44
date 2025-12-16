import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';

export default function OnboardingFirstName() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    if (!firstName.trim()) return;
    
    setIsLoading(true);
    try {
      const currentUser = await base44.auth.me();
      
      // Créer ou récupérer une session
      let sessionId = currentUser.sessionId;
      if (!sessionId) {
        const sessions = await base44.entities.Session.filter({ 
          created_by: currentUser.email 
        });
        
        if (sessions.length > 0) {
          sessionId = sessions[0].id;
        } else {
          const newSession = await base44.entities.Session.create({
            onboarding_history: [],
            onboarding_summary: {},
            current_question: null,
            is_onboarding_done: false
          });
          sessionId = newSession.id;
        }
        
        await base44.auth.updateMe({ sessionId });
      }
      
      await base44.auth.updateMe({ firstName: firstName.trim() });
      navigate(createPageUrl('OnboardingDynamic'));
    } catch (error) {
      console.error('Error saving firstName:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && firstName.trim()) {
      handleNext();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center shadow-lg">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-relaxed">
            Enchanté ! Commençons par faire connaissance 🙂
          </h1>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Je suis Nova, l'IA de Passion IA, et je vais t'aider à monétiser ton savoir-faire.
          </p>
          <p className="text-gray-600 text-sm mb-6">
            Pour démarrer : quel est ton prénom ?
          </p>

          <Input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ton prénom"
            className="w-full bg-white border-gray-300 text-gray-900 text-lg py-6 px-4 rounded-2xl focus:border-[#61f7a2] focus:ring-[#61f7a2] placeholder:text-gray-400"
            autoFocus
          />

          <div className="mt-8">
            <GlowButton
              onClick={handleNext}
              disabled={!firstName.trim()}
              loading={isLoading}
              className="w-full"
              size="lg"
            >
              Prêt à démarrer
              <ArrowRight className="w-5 h-5 ml-2" />
            </GlowButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
}