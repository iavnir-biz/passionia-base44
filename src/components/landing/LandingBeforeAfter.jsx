import React, { useEffect, useRef } from 'react';

const beforeItems = [
  "Tu passes des semaines à te demander quoi vendre",
  "Tu fixes tes prix au hasard (trop bas ou trop haut)",
  "Tu regardes les autres réussir pendant que toi tu doutes",
  "Tu accumules les formations mais tu ne lances jamais",
  "Tu as peur qu'on te dise \"pour qui tu te prends ?\"",
  "Tu te dis \"je le ferai quand je serai prêt\" — mais ce jour n'arrive jamais",
];

const afterItems = [
  "Tu sais exactement quoi vendre, à qui, et à quel prix",
  "Tes 4 offres sont structurées avec une logique d'ascension claire",
  "Tu as tes messages prêts à envoyer pour déclencher ta première vente",
  "Tu as un plan d'action jour par jour pour les 7 prochains jours",
  "Tu passes à l'action parce que tout est clair — plus de doutes",
  "Tu commences à encaisser tes premiers paiements",
];

export default function LandingBeforeAfter() {
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) e.target.classList.add('visible'); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="landing-fade" style={{
      padding: '100px 24px',
      background: '#0A0A0A',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle glow */}
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '700px',
        height: '400px',
        background: 'radial-gradient(ellipse, rgba(74,222,128,0.06) 0%, rgba(239,68,68,0.06) 50%, transparent 70%)',
        pointerEvents: 'none',
        filter: 'blur(80px)',
      }} />

      <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '100px',
          padding: '6px 18px',
          fontSize: '13px',
          color: 'rgba(255,255,255,0.5)',
          marginBottom: '28px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}>La transformation</div>

        <h2 style={{
          fontSize: 'clamp(28px, 4.5vw, 52px)',
          fontWeight: 400,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          marginBottom: '56px',
          color: '#fff',
        }}>
          Ce qui change{' '}
          <span style={{
            fontStyle: 'italic',
            fontWeight: 500,
            background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            display: 'inline-block',
            paddingRight: '0.3em',
            marginRight: '-0.3em',
            paddingBottom: '0.1em',
            marginBottom: '-0.1em',
          }}>vraiment</span>{' '}
          quand tu utilises Noah™
        </h2>

        <div className="before-after-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          textAlign: 'left',
        }}>
          {/* AVANT */}
          <div style={{
            background: 'rgba(239,68,68,0.05)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '20px',
            padding: '32px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '28px',
            }}>
              <span style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'rgba(239,68,68,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                flexShrink: 0,
              }}>✕</span>
              <span style={{
                fontSize: '14px',
                fontWeight: 700,
                color: '#EF4444',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
              }}>Avant Noah</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {beforeItems.map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}>
                  <span style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'rgba(239,68,68,0.12)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    color: '#EF4444',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}>✕</span>
                  <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.55 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* APRÈS */}
          <div style={{
            background: 'rgba(74,222,128,0.05)',
            border: '1px solid rgba(74,222,128,0.2)',
            borderRadius: '20px',
            padding: '32px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '28px',
            }}>
              <span style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'rgba(74,222,128,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                flexShrink: 0,
              }}>✓</span>
              <span style={{
                fontSize: '14px',
                fontWeight: 700,
                color: '#4ADE80',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
              }}>Après Noah</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {afterItems.map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}>
                  <span style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'rgba(74,222,128,0.12)',
                    border: '1px solid rgba(74,222,128,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    color: '#4ADE80',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}>✓</span>
                  <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.55 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .before-after-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
