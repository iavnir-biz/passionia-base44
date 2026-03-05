import React from 'react';
import { motion } from 'framer-motion';

export default function NoahWelcomeBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        borderRadius: '20px', padding: '28px 32px', position: 'relative',
        overflow: 'hidden', marginBottom: '24px'
      }}
    >
      {/* Neon glow inside banner */}
      <div style={{
        position: 'absolute', width: '200px', height: '200px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 70%)',
        top: '-40%', right: '10%', filter: 'blur(40px)', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', width: '150px', height: '150px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)',
        bottom: '-30%', left: '20%', filter: 'blur(40px)', pointerEvents: 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(255,255,255,0.1)', borderRadius: '100px',
          padding: '4px 12px', fontSize: '11px', color: 'rgba(255,255,255,0.6)',
          fontWeight: 500, marginBottom: '16px', border: '1px solid rgba(255,255,255,0.08)'
        }}>
          ✨ Nouveau
        </div>
        <h2 style={{
          fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 600, color: '#fff',
          letterSpacing: '-0.02em', marginBottom: '8px', lineHeight: 1.3
        }}>
          Bienvenue dans{' '}
          <span style={{
            fontStyle: 'italic',
            background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>iAvenir Lab</span>
        </h2>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: '500px' }}>
          La méthode complète pour vendre tes premiers produits de formation en ligne.
        </p>
      </div>
    </motion.div>
  );
}