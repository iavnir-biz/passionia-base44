import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Brain, Zap } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';

// Typing effect component
const TypingText = ({ text, className = "", delay = 0 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay + 30 + Math.random() * 30);
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, delay]);

  return <span className={className}>{displayedText}</span>;
};

// Nova AI Avatar - Animated
const NovaAvatar = () => (
  <div className="relative flex items-center justify-center mb-8">
    {/* Glow effect background */}
    <motion.div
      className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-[#61f7a2]/30 to-[#4de88f]/20 blur-2xl"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 0.8, 0.5]
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    
    {/* Main Nova Icon */}
    <motion.div
      className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center shadow-xl"
      animate={{
        y: [0, -8, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Brain className="w-12 h-12 text-white" />
      
      {/* Sparkle particles */}
      <motion.div
        className="absolute -top-2 -right-2"
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <Sparkles className="w-6 h-6 text-[#61f7a2]" />
      </motion.div>
      
      <motion.div
        className="absolute -bottom-1 -left-1"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      >
        <Zap className="w-5 h-5 text-[#61f7a2]" />
      </motion.div>
    </motion.div>
    
    {/* Pulse rings */}
    {[0, 0.5, 1].map((delay, i) => (
      <motion.div
        key={i}
        className="absolute w-24 h-24 rounded-full border-2 border-[#61f7a2]/30"
        animate={{
          scale: [1, 1.5, 1.8],
          opacity: [0.6, 0.3, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeOut",
          delay: delay * 1.5
        }}
      />
    ))}
  </div>
);

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
      
      await base44.auth.updateMe({ 
        firstName: firstName.trim(),
        sessionId 
      });
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
        {/* Nova Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <NovaAvatar />
        </motion.div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-relaxed">
            <TypingText text="Enchanté ! Commençons par faire connaissance 🙂" delay={0} />
          </h1>
          <p className="text-gray-700 mb-4 leading-relaxed">
            <TypingText 
              text="Je suis " 
              delay={1300}
            />
            <span className="text-[#61f7a2] font-semibold">
              <TypingText text="Nova" delay={1600} />
            </span>
            <TypingText 
              text=", l'IA de Passion IA, et je vais t'aider à monétiser ton savoir-faire." 
              delay={1900}
            />
          </p>
          <motion.p 
            className="text-sm text-gray-500 italic mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 5 }}
          >
            <TypingText 
              text="Une technologie d'intelligence artificielle développée par IAvenir Corporation"
              delay={5000}
            />
          </motion.p>
          <p className="text-gray-600 text-sm mb-6">
            <TypingText 
              text="Pour démarrer : quel est ton prénom ?"
              delay={7500}
            />
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