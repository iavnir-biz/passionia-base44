import React, { useEffect, useRef } from 'react';
import { ArrowRight, Check } from 'lucide-react';

export default function LandingPricing({ onCTA }) {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) e.target.classList.add('visible'); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const included = [
    "Génération de tes 4 offres complètes",
    "Pages de vente rédigées",
    "Séquence de 5 emails marketing",
    "Scripts de vente prêts à l'emploi",
    "Avatars clients détaillés",
    "Plan d'action 7 jours",
    "Validation marché par IA",
    "Accès à vie + mises à jour"
  ];

  return (
    <section id="pricing" ref={ref} className="landing-fade" style={{
      padding: '80px 24px',
      maxWidth: '560px',
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
      }}>Tarif</p>

      <h2 style={{
        fontSize: 'clamp(28px, 4vw, 44px)',
        fontWeight: 400,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
        marginBottom: '40px'
      }}>
        Commence <span style={{ fontStyle: 'italic' }}>maintenant</span>
      </h2>

      {/* Pricing card */}
      <div style={{
        background: '#fff',
        border: '2px solid #1a1a1a',
        borderRadius: '24px',
        padding: '40px 32px',
        position: 'relative'
      }}>
        {/* Badge */}
        <div style={{
          position: 'absolute',
          top: '-14px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1a1a1a',
          color: '#fff',
          padding: '5px 18px',
          borderRadius: '100px',
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '0.5px'
        }}>
          OFFRE LIMITÉE
        </div>

        <div style={{ marginBottom: '8px' }}>
          <span style={{ textDecoration: 'line-through', color: '#bbb', fontSize: '20px' }}>67€</span>
        </div>
        <div style={{ marginBottom: '32px' }}>
          <span style={{ fontSize: '56px', fontWeight: 700, letterSpacing: '-0.03em' }}>47€</span>
          <span style={{ fontSize: '16px', color: '#888', marginLeft: '8px' }}>paiement unique</span>
        </div>

        {/* Features list */}
        <div style={{ textAlign: 'left', marginBottom: '32px' }}>
          {included.map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 0',
              borderBottom: i < included.length - 1 ? '1px solid #f5f5f5' : 'none'
            }}>
              <Check size={16} color="#1a1a1a" strokeWidth={2.5} />
              <span style={{ fontSize: '14px', color: '#444' }}>{item}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onCTA}
          style={{
            width: '100%',
            background: '#1a1a1a',
            color: '#fff',
            border: 'none',
            padding: '16px',
            borderRadius: '100px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'opacity 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
          onMouseOut={e => e.currentTarget.style.opacity = '1'}
        >
          Accéder à NOAH™ — 47€ <ArrowRight size={16} />
        </button>

        <p style={{ marginTop: '12px', fontSize: '13px', color: '#bbb' }}>
          🔒 Paiement sécurisé · Garantie 30 jours
        </p>
      </div>
    </section>
  );
}