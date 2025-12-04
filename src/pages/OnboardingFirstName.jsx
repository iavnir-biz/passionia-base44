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
      await base44.auth.updateMe({ firstName: firstName.trim() });
      navigate(createPageUrl('Onboarding'));
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
    <div className="min-h-screen bg-[#11112b] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center glow-green">
            <Sparkles className="w-7 h-7 text-[#11112b]" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#1b1b33] rounded-2xl p-8 border border-[#2a2a45]">
          <h1 className="text-2xl font-bold text-white text-center mb-8">
            Commençons par faire connaissance.<br />
            Quel est ton prénom ?
          </h1>

          <Input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ton prénom"
            className="w-full bg-[#11112b] border-[#2a2a45] text-white text-lg py-6 px-4 rounded-xl focus:border-[#61f7a2] focus:ring-[#61f7a2] placeholder:text-gray-500"
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
              Suivant
              <ArrowRight className="w-5 h-5 ml-2" />
            </GlowButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
}