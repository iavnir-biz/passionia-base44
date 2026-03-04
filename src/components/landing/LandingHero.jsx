import React from 'react';
import { ArrowRight } from 'lucide-react';
import useFadeIn from './useFadeIn';

export default function LandingHero({ onCTA }) {
  const ref = useFadeIn();

  return (
    <section style={{ padding: '80px 24px 100px', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
      <div ref={ref} className="landing-fade">
        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: '#f5f5f5',
          borderRadius: '100px',
          padding: '8px 20px',
          marginBottom: '32px',
          fontSize: '14px',
          fontWeight: 500,
          color: '#666'
        }}>
          <span style={{
            background: '#1a1a1a',
            color: '#fff',
            padding: '2px 10px',
            borderRadius: '100px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.5px'
          }}>NOUVEAU</span>
          Pour ceux qui veulent monétiser leur savoir-faire →
        </div>

        {/* Titre — Style Amplemarket : gros, serif pour "italique" */}
        <h1 style={{
          fontSize: 'clamp(36px, 5.5vw, 64px)',
          fontWeight: 600,
          lineHeight: 1.1,
          letterSpacing: '-1.5px',
          marginBottom: '28px',
          color: '#1a1a1a'
        }}>
          Le système qui génère{' '}
          <span style={{ fontStyle: 'italic', fontWeight: 400 }}>tes 4 offres</span>{' '}
          et t'aide à viser{' '}
          <span style={{ fontStyle: 'italic', fontWeight: 400 }}>+4 000€/mois</span>
        </h1>

        <p style={{
          fontSize: '18px',
          color: '#888',
          maxWidth: '600px',
          margin: '0 auto 40px',
          lineHeight: 1.6
        }}>
          NOAH™ transforme ton savoir-faire en offres structurées, prêtes à vendre — avec les prix, pages de vente, emails et plan d'action.
        </p>

        {/* CTA style Amplemarket — bouton noir arrondi */}
        <button
          onClick={onCTA}
          style={{
            background: '#1a1a1a',
            color: '#fff',
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
          onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)'; }}
          onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          Commencer gratuitement <ArrowRight size={18} />
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          marginTop: '24px',
          flexWrap: 'wrap'
        }}>
          {['100% gratuit', 'Résultats en 5 min', 'Aucune compétence technique'].map((text, i) => (
            <span key={i} style={{ fontSize: '13px', color: '#999', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span> {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}