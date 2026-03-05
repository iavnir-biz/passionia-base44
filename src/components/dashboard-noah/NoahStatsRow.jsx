import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle } from 'lucide-react';

export default function NoahStatsRow({ session }) {
  const planProgress = session?.plan_progress || {};
  const completedDays = Object.values(planProgress).filter(d => d?.completed).length;
  const totalSteps = 7;
  const progressPercent = Math.round((completedDays / totalSteps) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}
    >
      {/* Progression */}
      <div style={{
        background: '#fff', border: '1px solid #e5e5e5', borderRadius: '16px',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <TrendingUp style={{ width: '14px', height: '14px', color: '#888' }} />
          <span style={{ fontSize: '12px', color: '#888', fontWeight: 500 }}>Progression</span>
        </div>
        <p style={{
          fontSize: '28px', fontWeight: 700, letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          {progressPercent}%
        </p>
        <p style={{ fontSize: '11px', color: '#bbb', marginTop: '4px' }}>du programme</p>
      </div>

      {/* Modules complétés */}
      <div style={{
        background: '#fff', border: '1px solid #e5e5e5', borderRadius: '16px',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <CheckCircle style={{ width: '14px', height: '14px', color: '#888' }} />
          <span style={{ fontSize: '12px', color: '#888', fontWeight: 500 }}>Étapes complétées</span>
        </div>
        <p style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.03em' }}>
          {completedDays}<span style={{ fontSize: '16px', color: '#bbb' }}>/{totalSteps}</span>
        </p>
        <p style={{ fontSize: '11px', color: '#bbb', marginTop: '4px' }}>jours validés</p>
      </div>
    </motion.div>
  );
}