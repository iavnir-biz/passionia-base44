import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930250f9337193d59c1dcf5/9089019f0_Sanstitre500x500px1.png";

export default function ThankYou() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch {}
    };
    loadUser();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(createPageUrl('OnboardingFirstName'));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  const firstName = user?.full_name?.split(' ')[0] || user?.firstName || '';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <img src={LOGO_URL} alt="Noah" style={{ width: '48px', height: '48px', margin: '0 auto 32px', objectFit: 'contain' }} />
        </motion.div>

        {/* Check circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          style={{
            width: '72px', height: '72px',
            borderRadius: '50%',
            background: '#1a1a1a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px',
          }}
        >
          <Check size={32} color="#fff" strokeWidth={3} />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            fontSize: '32px', fontWeight: 800, color: '#1a1a1a',
            letterSpacing: '-0.03em', marginBottom: '12px',
          }}
        >
          Paiement confirmé{firstName ? `, ${firstName}` : ''} !
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{
            fontSize: '16px', color: '#888', lineHeight: 1.6,
            marginBottom: '40px',
          }}
        >
          Ton accès est maintenant activé. Prépare-toi, Noah va créer ton business sur-mesure.
        </motion.p>

        {/* What's next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          style={{
            background: '#fafafa', borderRadius: '20px', padding: '28px',
            textAlign: 'left', marginBottom: '32px',
            border: '1px solid #f0f0f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Sparkles size={16} color="#f97316" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Ce qui t'attend
            </span>
          </div>
          {[
            "Tes 4 offres sur-mesure structurées par Noah",
            "Ton analyse de marché personnalisée",
            "Tes messages de vente prêts à l'emploi",
            "Ton plan d'action pour ta première vente",
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0,
                background: '#1a1a1a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Check size={12} color="#fff" strokeWidth={3} />
              </div>
              <span style={{ fontSize: '14px', color: '#555', lineHeight: 1.5 }}>{item}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          onClick={() => navigate(createPageUrl('OnboardingFirstName'))}
          style={{
            width: '100%', background: '#1a1a1a', color: '#fff',
            border: 'none', borderRadius: '100px', padding: '18px',
            fontSize: '16px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            transition: 'opacity 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
          onMouseOut={e => e.currentTarget.style.opacity = '1'}
        >
          Commencer maintenant
          <ArrowRight size={18} />
        </motion.button>

        {/* Auto redirect */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          style={{ fontSize: '12px', color: '#ccc', marginTop: '16px' }}
        >
          Redirection automatique dans {countdown}s...
        </motion.p>
      </motion.div>
    </div>
  );
}