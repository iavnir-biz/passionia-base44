import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

export default function NoahOnboardingSummary({ session }) {
  const summary = session?.onboarding_summary || {};
  const full = session?.onboarding_full || {};

  const items = [
    { label: 'Compétence', value: session?.skill || full?.coreSkill },
    { label: 'Audience cible', value: summary?.who_to_teach || full?.targetAudience },
    { label: 'Problème principal', value: summary?.main_learning_problem || full?.mainProblem },
    { label: 'Résultat rapide', value: summary?.quick_win || full?.firstQuickResult },
    { label: 'Transformation finale', value: summary?.big_transformation || full?.finalTransformation },
    { label: 'Méthode unique', value: summary?.method_angle || full?.uniqueMethod },
  ].filter(i => i.value);

  if (items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 }}
      style={{
        background: '#fff', border: '1px solid #e5e5e5', borderRadius: '20px',
        padding: '24px', marginBottom: '24px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <FileText style={{ width: '16px', height: '16px', color: '#1a1a1a' }} />
        </div>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.01em' }}>
          Résumé de ton profil
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{
              padding: '12px 16px', borderRadius: '12px',
              background: '#fafafa', border: '1px solid #f0f0f0'
            }}
          >
            <p style={{ fontSize: '11px', color: '#888', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              {item.label}
            </p>
            <p style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: 500, lineHeight: 1.5 }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}