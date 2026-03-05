import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CheckCircle, Circle, ArrowRight, Lock } from 'lucide-react';

const PLAN_STEPS = [
  { day: 1, title: "Découvrir ton produit principal", desc: "Explore ton offre et comprends sa valeur" },
  { day: 2, title: "Générer ton premier message de vente", desc: "Crée le message qui va toucher ton audience" },
  { day: 3, title: "Te positionner sur les réseaux", desc: "Publie ton premier contenu stratégique" },
  { day: 4, title: "Contacter tes premiers prospects", desc: "Envoie tes messages de vente personnalisés" },
  { day: 5, title: "Optimiser ton offre", desc: "Ajuste ton produit selon les retours" },
  { day: 6, title: "Lancer ta séquence email", desc: "Automatise ton système de vente" },
  { day: 7, title: "Analyser et scaler", desc: "Mesure tes résultats et passe à l'échelle" },
];

export default function NoahPlanAction({ session }) {
  const navigate = useNavigate();
  const planProgress = session?.plan_progress || {};
  
  const getCurrentDay = () => {
    for (let i = 1; i <= 7; i++) {
      if (!planProgress[i]?.completed) return i;
    }
    return 7;
  };

  const currentDay = getCurrentDay();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{
        background: '#fff', border: '1px solid #e5e5e5', borderRadius: '20px',
        padding: '24px', marginBottom: '24px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.01em' }}>
          Plan d'action <span style={{ color: '#888', fontWeight: 400 }}>· 7 jours</span>
        </h3>
        <button
          onClick={() => navigate(createPageUrl('PlanAction'))}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '12px', fontWeight: 500, color: '#888', background: 'none',
            border: 'none', cursor: 'pointer', padding: 0
          }}
        >
          Voir tout <ArrowRight size={12} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {PLAN_STEPS.map((step) => {
          const isCompleted = planProgress[step.day]?.completed;
          const isCurrent = step.day === currentDay;
          const isLocked = step.day > currentDay;

          return (
            <motion.div
              key={step.day}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + step.day * 0.05 }}
              onClick={() => !isLocked && navigate(createPageUrl('PlanAction'))}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '12px 16px', borderRadius: '14px',
                border: isCurrent ? '1px solid #1a1a1a' : '1px solid #f0f0f0',
                background: isCurrent ? '#fafafa' : '#fff',
                cursor: isLocked ? 'default' : 'pointer',
                opacity: isLocked ? 0.4 : 1,
                transition: 'all 0.2s'
              }}
            >
              {/* Status icon */}
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                background: isCompleted ? '#f0fdf4' : isCurrent ? '#1a1a1a' : '#f5f5f5'
              }}>
                {isCompleted ? (
                  <CheckCircle style={{ width: '14px', height: '14px', color: '#22c55e' }} />
                ) : isLocked ? (
                  <Lock style={{ width: '12px', height: '12px', color: '#ccc' }} />
                ) : (
                  <span style={{ fontSize: '11px', fontWeight: 700, color: isCurrent ? '#fff' : '#888' }}>
                    {step.day}
                  </span>
                )}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '13px', fontWeight: 600, color: '#1a1a1a',
                  textDecoration: isCompleted ? 'line-through' : 'none',
                  opacity: isCompleted ? 0.5 : 1
                }}>
                  {step.title}
                </p>
                {isCurrent && (
                  <p style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                    {step.desc}
                  </p>
                )}
              </div>

              {/* Arrow for current */}
              {isCurrent && !isCompleted && (
                <ArrowRight style={{ width: '14px', height: '14px', color: '#1a1a1a', flexShrink: 0 }} />
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}