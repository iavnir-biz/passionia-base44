import React, { useEffect, useRef } from 'react';

export default function LandingGuarantee() {
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) e.target.classList.add('visible'); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="landing-fade" style={{
      padding: '56px 24px',
      background: '#ffffff',
      textAlign: 'center',
    }}>
      <div style={{
        maxWidth: '560px',
        margin: '0 auto',
        background: '#fafafa',
        border: '1px solid #e8e8e8',
        borderRadius: '20px',
        padding: '40px 36px',
      }}>
        {/* Shield icon */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
        </div>

        <h3 style={{
          fontSize: 'clamp(18px, 2.5vw, 24px)',
          fontWeight: 600,
          color: '#1a1a1a',
          letterSpacing: '-0.02em',
          marginBottom: '16px',
        }}>
          Garantie 30 jours — satisfait ou remboursé
        </h3>

        <p style={{
          fontSize: '15px',
          color: '#666',
          lineHeight: 1.75,
          marginBottom: '12px',
        }}>
          Si Noah ne t'aide pas à clarifier tes offres et ton plan d'action,
          tu es remboursé intégralement. Sans question. Sans justification.
        </p>

        <p style={{
          fontSize: '15px',
          fontWeight: 600,
          color: '#1a1a1a',
          margin: 0,
        }}>
          On prend le risque à ta place.
        </p>
      </div>
    </section>
  );
}
