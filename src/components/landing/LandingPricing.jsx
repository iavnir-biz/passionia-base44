import React from 'react';
import { Check, ArrowRight, Shield } from 'lucide-react';
import useFadeIn from './useFadeIn';

const included = [
  "Génération complète de tes 4 offres",
  "Pages de vente personnalisées",
  "Séquence de 5 emails marketing",
  "Scripts de vente pour réseaux sociaux",
  "Avatars clients détaillés",
  "Analyse et validation de marché",
  "Plan d'action 7 jours",
  "Accès à vie + mises à jour"
];

export default function LandingPricing({ onCTA }) {
  const ref = useFadeIn();

  return (
    <section id="pricing" style={{ padding: '100px 24px' }}>
      <div ref={ref} className="landing-fade" style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#aaa', marginBottom: '16px' }}>
          Tarif
        </p>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 600, letterSpacing: '-1px', lineHeight: 1.15, marginBottom: '48px' }}>
          Commence{' '}
          <span style={{ fontStyle: 'italic', fontWeight: 400 }}>maintenant</span>
        </h2>

        <div style={{
          background: '#fff',
          border: '2px solid #1a1a1a',
          borderRadius: '20px',
          padding: '40px 32px',
          position: 'relative'
        }}>
          {/* Badge */}
          <div style={{
            position: 'absolute',
            top: '-14px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1a1a1a',
            color: '#fff',
            padding: '6px 20px',
            borderRadius: '100px',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.5px'
          }}>
            OFFRE LIMITÉE
          </div>

          <p style={{ color: '#999', fontSize: '16px', textDecoration: 'line-through', marginBottom: '4px' }}>67€</p>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '56px', fontWeight: 700, letterSpacing: '-2px' }}>47€</span>
          </div>
          <p style={{ fontSize: '14px', color: '#999', marginBottom: '32px' }}>Paiement unique · Accès à vie</p>

          <button
            onClick={onCTA}
            style={{
              width: '100%',
              background: '#1a1a1a',
              color: '#fff',
              border: 'none',
              padding: '18px 32px',
              borderRadius: '100px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '20px'
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            Accéder à NOAH™ — 47€ <ArrowRight size={18} />
          </button>

          <p style={{ fontSize: '13px', color: '#bbb', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Shield size={14} /> Paiement sécurisé · Garanti 30 jours
          </p>

          <div style={{ textAlign: 'left' }}>
            {included.map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 0',
                borderBottom: i < included.length - 1 ? '1px solid #f5f5f5' : 'none'
              }}>
                <Check size={18} color="#22c55e" />
                <span style={{ fontSize: '14px', color: '#555' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}