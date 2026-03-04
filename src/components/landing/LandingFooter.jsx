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
      {/* CTA final — dark with gradient title */}
      <section ref={ref} className="landing-fade" style={{
        padding: '100px 24px 80px',
        background: '#111',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle glow behind title */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -60%)',
          width: '500px',
          height: '300px',
          background: 'radial-gradient(ellipse, rgba(167,139,250,0.15) 0%, rgba(249,115,22,0.1) 40%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(40px)',
        }} />

        <div style={{ maxWidth: '650px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '100px',
            padding: '6px 16px',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '32px',
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #f97316, #a78bfa)',
              padding: '2px 10px',
              borderRadius: '100px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#fff',
            }}>NOAH™</span>
            Ton copilote IA
          </div>

          <h2 style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            color: '#fff',
            marginBottom: '20px',
          }}>
            Transforme ton savoir en{' '}
            <span style={{
              fontStyle: 'italic',
              background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>revenus</span>
          </h2>

          <p style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: '17px',
            marginBottom: '40px',
            lineHeight: 1.6,
          }}>
            Rejoins +500 créateurs qui ont lancé leur business grâce à NOAH™.
            <br />Offres, pages de vente, emails — tout est généré pour toi.
          </p>

          {/* CTA bar */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '100px',
            padding: '6px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <span style={{
              padding: '0 20px',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '15px',
            }}>
              100% gratuit pour commencer
            </span>
            <button
              onClick={onCTA}
              style={{
                background: '#fff',
                color: '#111',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '100px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'opacity 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              Commencer <ArrowRight size={16} />
            </button>
          </div>

          {/* Social proof */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginTop: '24px',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1,2,3,4,5].map(i => (
                <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#fff" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>+500 créateurs ont lancé leur business</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '24px',
        textAlign: 'center',
        background: '#111',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)' }}>
          © 2026 NOAH™ — Tous droits réservés
        </p>
      </footer>
    </>
  );
}