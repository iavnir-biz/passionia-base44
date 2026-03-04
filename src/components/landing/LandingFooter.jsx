import React from 'react';
import { ArrowRight } from 'lucide-react';
import useFadeIn from './useFadeIn';

export default function LandingFooter({ onCTA }) {
  const ref = useFadeIn();

  return (
    <>
      {/* CTA Final */}
      <section style={{ padding: '100px 24px', background: '#1a1a1a', textAlign: 'center' }}>
        <div ref={ref} className="landing-fade" style={{ maxWidth: '650px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 600,
            letterSpacing: '-1px',
            lineHeight: 1.15,
            color: '#fff',
            marginBottom: '20px'
          }}>
            Prêt à transformer ton{' '}
            <span style={{ fontStyle: 'italic', fontWeight: 400 }}>savoir-faire</span>{' '}
            en revenus ?
          </h2>
          <p style={{ color: '#777', fontSize: '17px', marginBottom: '36px', lineHeight: 1.6 }}>
            Rejoins les créateurs qui ont lancé leur business grâce à NOAH™.
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
              transition: 'all 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px'
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Commencer maintenant — 47€ <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '32px 24px',
        textAlign: 'center',
        borderTop: '1px solid #eee'
      }}>
        <p style={{ color: '#bbb', fontSize: '13px' }}>
          © 2026 NOAH™ — Tous droits réservés
        </p>
      </footer>
    </>
  );
}