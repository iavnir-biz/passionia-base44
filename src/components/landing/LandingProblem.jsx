import React, { useEffect, useRef } from 'react';

export default function LandingProblem() {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) e.target.classList.add('visible'); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const problems = [
    "Tu ne sais pas quel prix fixer",
    "Tu n'as pas de page de vente",
    "Tu ne sais pas par où commencer",
    "Tu as peur de ne pas être légitime",
    "Tu manques de temps pour tout créer",
    "Tu te perds dans la technique"
  ];

  return (
    <section ref={ref} className="landing-fade" style={{
      padding: '80px 24px',
      maxWidth: '900px',
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
      }}>Le problème</p>

      <h2 style={{
        fontSize: 'clamp(28px, 4vw, 44px)',
        fontWeight: 400,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
        marginBottom: '48px'
      }}>
        Tu as un talent. Mais <span style={{ fontStyle: 'italic' }}>tu ne sais pas</span> comment le vendre.
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        textAlign: 'left'
      }}>
        {problems.map((p, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '20px 24px',
            background: '#fafafa',
            borderRadius: '16px',
            border: '1px solid #f0f0f0'
          }}>
            <span style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#fee',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              flexShrink: 0
            }}>✕</span>
            <span style={{ fontSize: '15px', color: '#555' }}>{p}</span>
          </div>
        ))}
      </div>
    </section>
  );
}