import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, Rocket, FileText } from 'lucide-react';
import { NoahBrainIcon } from '@/components/NoahBrainIcon';
import confetti from 'canvas-confetti';

const items = [
  { icon: CheckCircle2, title: 'Ton idee validee et ton positionnement' },
  { icon: Package, title: '4 offres personnalisees, pretes a vendre' },
  { icon: FileText, title: 'Pages de vente, emails et messages' },
  { icon: Rocket, title: 'Un plan d\'action sur 7 jours' },
];

const statusTexts = [
  'Analyse de ton positionnement…',
  'Structuration de tes offres…',
  'Estimation de ton potentiel…',
  'Preparation du plan d\'action…'
];

function fireConfetti() {
  // Burst 1 — center explosion
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { x: 0.5, y: 0.5 },
    colors: ['#61f7a2', '#4de88f', '#2dd4bf', '#fbbf24', '#f472b6'],
    ticks: 120,
  });

  // Burst 2 — left side
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: ['#61f7a2', '#4de88f', '#fbbf24'],
      ticks: 100,
    });
  }, 400);

  // Burst 3 — right side
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: ['#61f7a2', '#2dd4bf', '#f472b6'],
      ticks: 100,
    });
  }, 700);

  // Burst 4 — top rain
  setTimeout(() => {
    confetti({
      particleCount: 40,
      spread: 160,
      origin: { x: 0.5, y: 0 },
      gravity: 1.2,
      colors: ['#61f7a2', '#fbbf24', '#4de88f'],
      ticks: 140,
    });
  }, 1100);
}

export default function OnboardingTransition() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [ready, setReady] = useState(false);
  const [visibleItems, setVisibleItems] = useState(0);
  const [progress, setProgress] = useState(75);
  const [statusIndex, setStatusIndex] = useState(0);

  // Load user + session data, enrich user, then reveal
  useEffect(() => {
    loadAndPrepare();
  }, []);

  // Multi-burst confetti when ready
  useEffect(() => {
    if (ready) {
      fireConfetti();
    }
  }, [ready]);

  // Items appear one by one (fast: 300ms each)
  useEffect(() => {
    if (ready && visibleItems < items.length) {
      const timer = setTimeout(() => setVisibleItems(v => v + 1), 300);
      return () => clearTimeout(timer);
    }
  }, [ready, visibleItems]);

  // Progress bar animation
  useEffect(() => {
    if (!ready) return;
    const timer = setInterval(() => {
      setProgress(p => (p >= 95 ? 95 : p + 1));
    }, 200);
    return () => clearInterval(timer);
  }, [ready]);

  // Rotating status text
  useEffect(() => {
    if (!ready) return;
    const timer = setInterval(() => {
      setStatusIndex(i => (i + 1) % statusTexts.length);
    }, 1800);
    return () => clearInterval(timer);
  }, [ready]);

  // Auto-redirect after 7s once ready
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      navigate(createPageUrl('OnboardingQ12AgeRange'));
    }, 7000);
    return () => clearTimeout(timer);
  }, [ready]);

  const loadAndPrepare = async () => {
    try {
      const currentUser = await base44.auth.me();
      const name = localStorage.getItem('onboarding_firstName') || currentUser.firstName || '';
      setFirstName(name);

      const resolvedSessionId = localStorage.getItem('passionia_active_session_id') || currentUser.sessionId;
      if (!resolvedSessionId) {
        navigate(createPageUrl('OnboardingFirstName'));
        return;
      }

      const sessions = await base44.entities.Session.filter({ id: resolvedSessionId });
      if (!sessions || sessions.length === 0) {
        navigate(createPageUrl('OnboardingFirstName'));
        return;
      }

      const session = sessions[0];

      if ((session.onboarding_history?.length || 0) < 11) {
        navigate(createPageUrl('OnboardingDynamic'));
        return;
      }

      // Enrich user with onboarding data
      const fullData = session.onboarding_full || {};
      await base44.auth.updateMe({
        firstName: name,
        coreSkill: session.skill || fullData.coreSkill || '',
        targetAudience: fullData.targetAudience || '',
        mainProblem: fullData.mainProblem || '',
        firstResult: fullData.firstQuickResult || '',
        finalTransformation: fullData.finalTransformation || '',
        uniqueMethod: fullData.uniqueMethod || '',
        typicalMistake: fullData.typicalMistake || '',
        extraDetail: fullData.extraDetail || ''
      });

      setReady(true);
    } catch (error) {
      console.error('[OnboardingTransition] Error:', error);
      setReady(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Noah avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <NoahBrainIcon size={72} isThinking={true} isFloating={true} />
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {ready ? `Bravo ${firstName}, c'est prometteur.` : 'Analyse en cours…'}
          </h1>
          <p className="text-sm text-gray-500">
            {ready ? 'Voici ce que Noah va construire pour toi :' : 'Noah etudie tes reponses…'}
          </p>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-1.5">
            <motion.span
              key={statusIndex}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-gray-500"
            >
              {statusTexts[statusIndex]}
            </motion.span>
            <span className="text-xs font-bold text-[#61f7a2]">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#61f7a2] to-[#2dd4bf] rounded-full"
              initial={{ width: '75%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'linear' }}
            />
          </div>
        </motion.div>

        {/* Items */}
        <div className="space-y-2.5">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={i < visibleItems ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.35 }}
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm"
              >
                <div className="flex-shrink-0 w-9 h-9 bg-[#61f7a2]/15 rounded-lg flex items-center justify-center">
                  <Icon className="w-[18px] h-[18px] text-[#3dd67a]" />
                </div>
                <span className="text-sm font-medium text-gray-800">{item.title}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Subtle reassurance */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : {}}
          transition={{ delay: 2 }}
          className="text-center text-xs text-gray-400 mt-8"
        >
          Encore quelques questions pour affiner le resultat.
        </motion.p>
      </div>
    </div>
  );
}
