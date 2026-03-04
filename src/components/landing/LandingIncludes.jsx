import React, { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';

export default function LandingIncludes() {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) e.target.classList.add('visible'); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const items = [
    "4 offres complètes générées par IA",
    "Pages de vente personnalisées",
    "5 emails marketing prêts à l'emploi",
    "Scripts de vente pour réseaux sociaux",
    "Avatars clients détaillés",
    "Validation marché avec données réelles",
    "Plan d'action 7 jours",
    "Accès à vie + mises à jour"
  ];

  return (
    <section ref={ref} className="landing-fade" style={{
      padding: '80px 24px',
      maxWidth: '700px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <p style={{
        fontSize: '13px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        color: '#999',
        marginBottom: '16px'
      }}>Ce que tu obtiens</p>

      <h2 style={{
        fontSize: 'clamp(28px, 4vw, 44px)',
        fontWeight: 400,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
        marginBottom: '48px'
      }}>
        Tout ce qu'il faut pour <span style={{ fontStyle: 'italic' }}>lancer</span>
      </h2>

      <div style={{ textAlign: 'left' }}>
        {items.map((item, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px 0',
            borderBottom: i < items.length - 1 ? '1px solid #f0f0f0' : 'none'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#f0faf0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Check size={14} color="#2d8a4e" strokeWidth={3} />
            </div>
            <span style={{ fontSize: '16px', color: '#333' }}>{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}