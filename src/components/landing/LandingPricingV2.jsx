import React, { useEffect, useRef } from 'react';
import { ArrowRight, Check } from 'lucide-react';

export default function LandingPricingV2({ onCTA }) {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) e.target.classList.add('visible'); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const included = [
    "Tes 4 offres sur-mesure structurées avec les prix :\nOffre principale, petit extra, offre supérieure, offre premium avec les prix optimaux",
    "Messages personnalisés pour vendre",
    "Analyse de marché + validation de ton idée",
    "3 avatars clients détaillés",
    "Structure d'ascension claire",
    "Accès à vie + mises à jour",
  ];

  const closing = "Tu comprends quoi vendre.\nÀ qui.\nEt dans quel ordre.";

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

      {/* Gradient arrow pointing down */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '24px',
      }}>
        <svg width="40" height="48" viewBox="0 0 40 48" fill="none">
          <defs>
            <linearGradient id="arrowGradV2" x1="0" y1="0" x2="40" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <path d="M20 0 L20 36 M8 26 L20 40 L32 26" stroke="url(#arrowGradV2)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>

      {/* Pricing card */}
      <div style={{
        background: '#fff',
        border: '2px solid transparent',
        borderRadius: '24px',
        padding: '40px 32px',
        position: 'relative',
        backgroundClip: 'padding-box',
      }}>
        {/* Gradient border overlay */}
        <div style={{
          position: 'absolute',
          inset: '-2px',
          borderRadius: '26px',
          background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
          zIndex: -1,
        }} />
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
          <span style={{ textDecoration: 'line-through', color: '#bbb', fontSize: '20px' }}>97€</span>
        </div>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ fontSize: '56px', fontWeight: 700, letterSpacing: '-0.03em' }}>29€</span>
          <span style={{ fontSize: '16px', color: '#888', marginLeft: '8px' }}>paiement unique</span>
        </div>
        <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '24px' }}>
          Sans engagement · Accès immédiat
        </p>

        {/* Features list */}
        <div style={{ textAlign: 'left', marginBottom: '24px' }}>
          {included.map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '10px 0',
              borderBottom: i < included.length - 1 ? '1px solid #f5f5f5' : 'none'
            }}>
              <Check size={16} color="#1a1a1a" strokeWidth={2.5} style={{ marginTop: '2px', flexShrink: 0 }} />
              <span style={{ fontSize: '14px', color: '#444', whiteSpace: 'pre-line', lineHeight: 1.6 }}>{item}</span>
            </div>
          ))}
        </div>

        {/* Closing statement */}
        <div style={{
          background: '#fafafa',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '32px',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '15px',
            fontWeight: 600,
            color: '#1a1a1a',
            lineHeight: 1.7,
            margin: 0,
            whiteSpace: 'pre-line',
          }}>{closing}</p>
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
          Je veux savoir quoi vendre — 29€ <ArrowRight size={16} />
        </button>

        <p style={{ marginTop: '12px', fontSize: '13px', color: '#bbb' }}>
          🔒 Paiement sécurisé · Garantie 30 jours
        </p>
      </div>
    </section>
  );
}
