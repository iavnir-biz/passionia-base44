import React, { useEffect, useRef } from 'react';

const cards = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
        <line x1="2" y1="2" x2="22" y2="22" />
      </svg>
    ),
    title: "Pas 40h de vidéos à regarder",
    desc: "Les formations te donnent des concepts. Noah te donne des résultats. Tu entres ton expertise, tu ressors avec des offres prêtes à vendre. En 15 minutes, pas en 3 mois.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="12" y2="15"/>
        <line x1="3" y1="3" x2="21" y2="21" />
      </svg>
    ),
    title: "Pas un template copié-collé",
    desc: "Noah analyse TON savoir-faire, TON marché, TES clients idéaux. Chaque offre est générée sur-mesure. Zéro générique.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        <circle cx="12" cy="16" r="1" fill="currentColor"/>
      </svg>
    ),
    title: "Pas un chatbot qui hallucine",
    desc: "Noah est entraîné sur des frameworks business éprouvés. Il structure tes offres comme un consultant à 5000€ — pour 29€.",
  },
];

export default function LandingWhyDifferent() {
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) e.target.classList.add('visible'); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="landing-fade" style={{
      padding: '100px 24px',
      background: '#ffffff',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Badge */}
        <p style={{
          fontSize: '13px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: '#999',
          marginBottom: '16px'
        }}>Pourquoi Noah™</p>

        <h2 style={{
          fontSize: 'clamp(28px, 4.5vw, 52px)',
          fontWeight: 400,
          lineHeight: 1.2,
          letterSpacing: '-0.03em',
          marginBottom: '56px',
          color: '#1a1a1a',
        }}>
          Ce n'est pas une formation. Ce n'est pas un template. C'est{' '}
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
          }}>ton système.</span>
        </h2>

        <div className="why-different-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          textAlign: 'left',
        }}>
          {cards.map((card, i) => (
            <div key={i} style={{
              padding: '32px',
              borderRadius: '20px',
              border: '1px solid #e8e8e8',
              background: '#fafafa',
              transition: 'border-color 0.3s, box-shadow 0.3s',
              cursor: 'default',
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = '#d4d4d4'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.06)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = '#e8e8e8'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                color: '#666',
              }}>
                {card.icon}
              </div>
              <h3 style={{
                fontSize: '17px',
                fontWeight: 600,
                marginBottom: '10px',
                letterSpacing: '-0.01em',
                color: '#1a1a1a',
              }}>{card.title}</h3>
              <p style={{
                fontSize: '14px',
                color: '#666',
                lineHeight: 1.65,
                margin: 0,
              }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .why-different-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 769px) and (max-width: 900px) {
          .why-different-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}
