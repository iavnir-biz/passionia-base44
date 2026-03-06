import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThankYou() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch {}
    };
    loadUser();
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || user?.firstName || '';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Blob top-left */}
      <div style={{
        position: 'absolute',
        top: '-80px',
        left: '-80px',
        width: '320px',
        height: '320px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,180,160,0.35) 0%, rgba(255,200,180,0.15) 50%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />

      {/* Blob top-right */}
      <div style={{
        position: 'absolute',
        top: '-60px',
        right: '-60px',
        width: '280px',
        height: '280px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,180,255,0.3) 0%, rgba(220,200,255,0.12) 50%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Badge NOAH™ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '28px',
          }}
        >
          <span style={{
            background: 'linear-gradient(135deg, #f97316, #ec4899)',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 800,
            padding: '5px 12px',
            borderRadius: '100px',
            letterSpacing: '0.5px',
          }}>NOAH™</span>
          <span style={{ fontSize: '14px', color: '#999', fontWeight: 500 }}>Paiement confirmé</span>
        </motion.div>

        {/* Check circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          style={{
            width: '64px', height: '64px',
            borderRadius: '50%',
            background: '#1a1a1a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px',
          }}
        >
          <Check size={28} color="#fff" strokeWidth={3} />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            fontSize: '28px', fontWeight: 700, color: '#1a1a1a',
            letterSpacing: '-0.02em', marginBottom: '12px',
            lineHeight: 1.3,
          }}
        >
          {firstName ? `Merci ${firstName}, ton accès est activé !` : 'Merci, ton accès est activé !'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            fontSize: '16px', color: '#888', lineHeight: 1.6,
            marginBottom: '36px',
          }}
        >
          Prépare-toi, Noah va créer ton business sur-mesure.
        </motion.p>

        {/* What's next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{
            background: '#fafafa', borderRadius: '20px', padding: '24px 28px',
            textAlign: 'left', marginBottom: '32px',
            border: '1px solid #f0f0f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Sparkles size={16} color="#f97316" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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

        {/* Screenshot preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          style={{
            marginBottom: '32px',
            perspective: '1000px',
          }}
        >
          <p style={{
            fontSize: '14px',
            color: '#555',
            fontWeight: 400,
            marginBottom: '16px',
            lineHeight: 1.6,
          }}>
            ⚠️ Attention : sur la page suivante, vous devrez créer un nouveau compte en cliquant sur <strong>Sign up</strong>.
          </p>
          <div style={{
            background: '#f8f9fb',
            borderRadius: '16px',
            padding: '8px',
            border: '1px solid #e8e8e8',
            boxShadow: '0 12px 40px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
            transform: 'rotateY(-2deg) rotateX(1deg)',
          }}>
            {/* Browser bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderBottom: '1px solid #eee',
              marginBottom: '4px',
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffbd2e' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#28c840' }} />
              <div style={{
                flex: 1, marginLeft: '8px',
                background: '#f0f0f0', borderRadius: '6px',
                height: '20px',
              }} />
            </div>
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930250f9337193d59c1dcf5/8c66eeef4_iavnir1000x1000px.png"
              alt="Étape suivante"
              style={{
                width: '100%',
                borderRadius: '10px',
                display: 'block',
              }}
            />
          </div>

          <p style={{ fontSize: '12px', color: '#bbb', marginTop: '12px', fontStyle: 'italic' }}>
            Ton espace Noah t'attend après inscription 👆
          </p>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={() => navigate(createPageUrl('OnboardingFirstName'))}
          style={{
            background: '#1a1a1a', color: '#fff',
            border: 'none', borderRadius: '100px',
            padding: '16px 48px',
            fontSize: '16px', fontWeight: 600, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            transition: 'opacity 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
          onMouseOut={e => e.currentTarget.style.opacity = '1'}
        >
          Commencer maintenant
          <ArrowRight size={18} />
        </motion.button>
      </motion.div>
    </div>
  );
}