import React, { useEffect, useRef } from 'react';

export default function LandingHowItWorks() {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) e.target.classList.add('visible'); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const steps = [
    { num: '01', title: "Réponds à quelques questions", desc: "5 minutes pour décrire ton expertise et tes objectifs." },
    { num: '02', title: "NOAH™ analyse et génère", desc: "L'IA crée tes 4 offres, valide ton marché et rédige tous tes contenus." },
    { num: '03', title: "Lance ta première vente", desc: "Suis le plan d'action jour par jour et fais ta première vente." }
  ];

  return (
    <section ref={ref} className="landing-fade" style={{
      padding: '80px 24px',
      background: '#fafafa'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{
          fontSize: '13px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: '#999',
          marginBottom: '16px'
        }}>Comment ça marche</p>

        <h2 style={{
          fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: 400,
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
          marginBottom: '56px'
        }}>
          3 étapes. <span style={{ fontStyle: 'italic' }}>5 minutes.</span> Tout est prêt.
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '24px',
              textAlign: 'left',
              padding: '28px',
              background: '#fff',
              borderRadius: '20px',
              border: '1px solid #eee'
            }}>
              <span style={{
                fontFamily: 'Inter',
                fontSize: '13px',
                fontWeight: 700,
                color: '#bbb',
                letterSpacing: '0.5px',
                flexShrink: 0,
                paddingTop: '2px'
              }}>
                {s.num}
              </span>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px', letterSpacing: '-0.01em' }}>{s.title}</h3>
                <p style={{ fontSize: '15px', color: '#888', lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}