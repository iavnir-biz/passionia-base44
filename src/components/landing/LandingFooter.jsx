import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

export default function LandingFooter({ onCTA }) {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) e.target.classList.add('visible'); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      {/* CTA final */}
      <section ref={ref} className="landing-fade" style={{
        padding: '80px 24px',
        background: '#1a1a1a',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '650px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            color: '#fff',
            marginBottom: '16px'
          }}>
            Prêt à transformer ton <span style={{ fontStyle: 'italic' }}>savoir-faire</span> en revenus ?
          </h2>
          <p style={{ color: '#888', fontSize: '17px', marginBottom: '36px' }}>
            Rejoins +500 créateurs qui ont lancé leur business grâce à NOAH™.
          </p>
          <button
            onClick={onCTA}
            style={{
              background: '#fff',
              color: '#1a1a1a',
              border: 'none',
              padding: '16px 36px',
              borderRadius: '100px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'opacity 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={e => e.currentTarget.style.opacity = '1'}
          >
            Commencer maintenant <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '32px 24px',
        textAlign: 'center',
        borderTop: '1px solid #f0f0f0'
      }}>
        <p style={{ fontSize: '13px', color: '#bbb' }}>
          © 2026 NOAH™ — Tous droits réservés
        </p>
      </footer>
    </>
  );
}