import React from 'react';
import useFadeIn from './useFadeIn';

export default function LandingProblem() {
  const ref = useFadeIn();

  const problems = [
    "Tu ne sais pas quel prix fixer pour ton savoir",
    "Tu n'as pas de page de vente ni d'offre claire",
    "Tu ne sais pas par où commencer concrètement",
    "Tu bloques sur la technique et les outils",
    "Tu as peur de ne pas être légitime",
    "Tu manques de temps pour tout créer seul(e)"
  ];

  return (
    <section style={{ padding: '100px 24px', background: '#fafafa' }}>
      <div ref={ref} className="landing-fade" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: '#aaa',
          marginBottom: '16px'
        }}>
          Le constat
        </p>
        <h2 style={{
          fontSize: 'clamp(28px, 4vw, 48px)',
          fontWeight: 600,
          letterSpacing: '-1px',
          lineHeight: 1.15,
          marginBottom: '56px'
        }}>
          Tu as un talent précieux...<br />
          <span style={{ fontStyle: 'italic', fontWeight: 400 }}>mais tu ne sais pas comment le vendre</span>
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
          textAlign: 'left'
        }}>
          {problems.map((text, i) => (
            <div key={i} style={{
              background: '#fff',
              borderRadius: '14px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              border: '1px solid #eee'
            }}>
              <span style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                flexShrink: 0,
                color: '#ef4444'
              }}>✗</span>
              <span style={{ fontSize: '15px', color: '#555' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}