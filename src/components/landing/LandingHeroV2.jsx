import React, { useEffect, useRef } from 'react';

export default function LandingHeroV2() {
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) e.target.classList.add('visible'); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="landing-fade landing-hero-section" style={{
      textAlign: 'center',
      padding: '80px 24px 40px',
      maxWidth: '820px',
      margin: '0 auto'
    }}>
      {/* Badge pill */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: '#f5f5f5',
        border: '1px solid #e8e8e8',
        borderRadius: '100px',
        padding: '6px 16px',
        fontSize: '13px',
        color: '#666',
        marginBottom: '32px'
      }}>
        <span style={{
          background: '#1a1a1a',
          color: '#fff',
          padding: '2px 8px',
          borderRadius: '100px',
          fontSize: '11px',
          fontWeight: 600,
        }}>Noah AI</span>
        Pour ceux qui veulent monétiser leur savoir en ligne →
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: 'clamp(28px, 4.5vw, 52px)',
        fontWeight: 400,
        lineHeight: 1.2,
        letterSpacing: '-0.03em',
        color: '#1a1a1a',
        marginBottom: '24px'
      }}>
        <span style={{
          fontWeight: 600,
          background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          display: 'inline-block',
          paddingRight: '0.3em',
          marginRight: '-0.3em',
          paddingBottom: '0.1em',
          marginBottom: '-0.1em',
        }}>Noah AI</span> transforme ton savoir-faire<br />
        en 4 offres qui se vendent<br />
        — même si tu pars de zéro
      </h1>

      <p style={{
        fontSize: '17px',
        color: '#888',
        lineHeight: 1.6,
        maxWidth: '580px',
        margin: '0 auto',
      }}>
        En 15 minutes, NOAH™ génère tes 4 offres (de 17€ à +1000€),
        tes messages de vente et ton plan d'action pour viser +4 000€/mois.
        Tu n'as rien à créer. Tu n'as rien à inventer. Tu lances.
      </p>
    </section>
  );
}
