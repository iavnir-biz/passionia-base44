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
      {/* CTA final — dark Amplemarket style */}
      <section ref={ref} className="landing-fade" style={{
        padding: '100px 24px 80px',
        background: '#111111',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle glow behind title */}
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '350px',
          background: 'radial-gradient(ellipse, rgba(167,139,250,0.18) 0%, rgba(249,115,22,0.12) 40%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(60px)',
        }} />

        <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Badge pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '100px',
            padding: '6px 18px',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.55)',
            marginBottom: '36px',
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #f97316, #a78bfa)',
              padding: '3px 12px',
              borderRadius: '100px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '0.5px',
            }}>NOAH™</span>
            Ton copilote IA
          </div>

          {/* Big title with gradient word */}
          <h2 style={{
            fontSize: 'clamp(34px, 5.5vw, 60px)',
            fontWeight: 400,
            lineHeight: 1.12,
            letterSpacing: '-0.035em',
            color: '#fff',
            marginBottom: '24px',
          }}>
            Transforme ton savoir en{' '}
            <span style={{
              fontStyle: 'italic',
              fontWeight: 500,
              background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>revenus</span>
          </h2>

          <p style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: '17px',
            marginBottom: '44px',
            lineHeight: 1.65,
            maxWidth: '520px',
            margin: '0 auto 44px',
          }}>
            Rejoins +500 créateurs qui ont lancé leur activité de formation en ligne grâce à NOAH™.
            Offres, pages de vente, emails — tout est généré pour toi.
          </p>

          {/* CTA bar — responsive */}
          <div className="footer-cta-bar" style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '100px',
            padding: '6px',
            border: '1px solid rgba(255,255,255,0.08)',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            <span className="footer-cta-price" style={{
              padding: '0 22px',
              color: 'rgba(255,255,255,0.35)',
              fontSize: '15px',
            }}>
              29€ · sans engagement · paiement unique
            </span>
            <button
              onClick={onCTA}
              style={{
                background: '#fff',
                color: '#111',
                border: 'none',
                padding: '14px 30px',
                borderRadius: '100px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'opacity 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              Accéder à NOAH™ — 29€ <ArrowRight size={16} />
            </button>
          </div>

          <style>{`
            @media (max-width: 600px) {
              .footer-cta-bar {
                flex-direction: column !important;
                border-radius: 20px !important;
                gap: 4px;
                width: 100%;
                max-width: 320px;
              }
              .footer-cta-price {
                padding: 10px 16px !important;
                font-size: 13px !important;
                text-align: center;
              }
              .footer-cta-bar button {
                width: 100% !important;
                justify-content: center !important;
              }
            }
          `}</style>

          {/* Social proof */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '28px',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1,2,3,4,5].map(i => (
                <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#fff" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>+500 créateurs ont lancé leur activité de formation en ligne</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '24px 24px 32px',
        textAlign: 'center',
        background: '#111111',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.2)', marginBottom: '4px' }}>
          © 2026 NOAH™ — Tous droits réservés
        </p>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.15)', marginBottom: '16px' }}>
          Copyright by iAvenir
        </p>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.12)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.5 }}>
          Ce site n'est pas affilié à Facebook™, Instagram™ ou Meta Platforms, Inc. Facebook™ et Instagram™ sont des marques déposées de Meta Platforms, Inc. Les résultats peuvent varier selon les individus et dépendent de nombreux facteurs. Ce site ne garantit aucun résultat spécifique.
        </p>
      </footer>
    </>
  );
}