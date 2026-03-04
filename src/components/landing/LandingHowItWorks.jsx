import React from 'react';
import useFadeIn from './useFadeIn';

const steps = [
  { num: "01", title: "Réponds à quelques questions", desc: "5 minutes pour décrire ton expertise, ton audience et tes objectifs." },
  { num: "02", title: "NOAH™ analyse et génère", desc: "L'IA crée tes 4 offres, valide ton marché et rédige tous tes contenus." },
  { num: "03", title: "Lance ta première vente", desc: "Suis le plan d'action jour par jour et fais ta première vente cette semaine." }
];

export default function LandingHowItWorks() {
  const ref = useFadeIn();

  return (
    <section style={{ padding: '100px 24px', background: '#fafafa' }}>
      <div ref={ref} className="landing-fade" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#aaa', marginBottom: '16px' }}>
          Comment ça marche
        </p>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 600, letterSpacing: '-1px', lineHeight: 1.15, marginBottom: '64px' }}>
          3 étapes.{' '}
          <span style={{ fontStyle: 'italic', fontWeight: 400 }}>5 minutes.</span>{' '}
          Tout est prêt.
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {steps.map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '28px',
              textAlign: 'left'
            }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: '#1a1a1a',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '16px',
                flexShrink: 0,
                letterSpacing: '-0.5px'
              }}>
                {item.num}
              </div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', letterSpacing: '-0.3px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '15px', color: '#888', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}