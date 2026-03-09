import React, { useEffect, useRef } from 'react';

const founders = [
  {
    name: "Damien",
    title: "Co-fondateur",
    stats: "+1 900 élèves accompagnés · +500 000€ générés",
    desc: "Expert en création d'offres qui se vendent.",
    initials: "D",
    gradient: "linear-gradient(135deg, #f97316, #ec4899)",
  },
  {
    name: "Alfred",
    title: "Co-fondateur & CEO",
    stats: "Multi-entrepreneur · Expert IA & automatisation",
    desc: "Transforme la complexité tech en systèmes simples et rentables.",
    initials: "A",
    gradient: "linear-gradient(135deg, #a78bfa, #3b82f6)",
  },
];

export default function LandingFounders() {
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
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        height: '300px',
        background: 'radial-gradient(ellipse, rgba(167,139,250,0.1) 0%, rgba(249,115,22,0.07) 50%, transparent 70%)',
        pointerEvents: 'none',
        filter: 'blur(60px)',
      }} />

      <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
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
        }}>Les fondateurs</div>

        <h2 style={{
          fontSize: 'clamp(26px, 4vw, 48px)',
          fontWeight: 400,
          lineHeight: 1.2,
          letterSpacing: '-0.03em',
          marginBottom: '56px',
          color: '#fff',
          maxWidth: '750px',
          margin: '0 auto 56px',
        }}>
          On a créé Noah parce qu'on en avait marre de voir des gens talentueux ne{' '}
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
          }}>jamais</span>{' '}
          lancer.
        </h2>

        <div className="founders-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginBottom: '48px',
        }}>
          {founders.map((f, i) => (
            <div key={i} style={{
              padding: '36px 32px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)',
              textAlign: 'left',
              transition: 'background 0.3s, border-color 0.3s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
              {/* Avatar */}
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: f.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 700,
                color: '#fff',
                marginBottom: '20px',
              }}>
                {f.initials}
              </div>

              {/* Name + title */}
              <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#fff',
                marginBottom: '4px',
                letterSpacing: '-0.01em',
              }}>{f.name}</h3>
              <p style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.4)',
                marginBottom: '16px',
                fontWeight: 500,
              }}>{f.title}</p>

              {/* Stats */}
              <div style={{
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '10px',
                padding: '10px 14px',
                marginBottom: '16px',
              }}>
                <p style={{
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.65)',
                  margin: 0,
                  fontWeight: 500,
                }}>{f.stats}</p>
              </div>

              {/* Description */}
              <p style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.6,
                margin: 0,
              }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Closing line */}
        <p style={{
          fontSize: '16px',
          color: 'rgba(255,255,255,0.4)',
          lineHeight: 1.7,
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          On a combiné notre expérience pour créer l'outil qu'on aurait rêvé d'avoir quand on a démarré.
        </p>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .founders-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
