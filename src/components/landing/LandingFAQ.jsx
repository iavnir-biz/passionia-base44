import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import useFadeIn from './useFadeIn';

const faqs = [
  { q: "J'ai besoin de compétences techniques ?", a: "Non. NOAH™ te guide pas à pas. Tu n'as qu'à répondre aux questions et tout est généré automatiquement." },
  { q: "Combien de temps pour voir des résultats ?", a: "La génération prend 5 minutes. Avec le plan d'action, tu peux faire ta première vente en 24h à 7 jours." },
  { q: "Mon domaine est-il compatible ?", a: "Si tu as une expertise que d'autres veulent apprendre (cuisine, langues, fitness, business, créativité...), oui." },
  { q: "C'est un abonnement ?", a: "Non. Paiement unique de 47€, accès à vie, mises à jour incluses." },
  { q: "Et si ça ne marche pas pour moi ?", a: "Tu as 30 jours pour tester. Remboursé intégralement si tu n'es pas satisfait — sans justification." }
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }}
      onClick={() => setOpen(!open)}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 0',
        gap: '16px'
      }}>
        <span style={{ fontSize: '16px', fontWeight: 500 }}>{q}</span>
        <ChevronDown
          size={20}
          color="#999"
          style={{
            transition: 'transform 0.25s',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            flexShrink: 0
          }}
        />
      </div>
      <div style={{
        maxHeight: open ? '200px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.3s ease'
      }}>
        <p style={{ fontSize: '15px', color: '#888', lineHeight: 1.6, paddingBottom: '20px' }}>{a}</p>
      </div>
    </div>
  );
}

export default function LandingFAQ() {
  const ref = useFadeIn();

  return (
    <section style={{ padding: '100px 24px', background: '#fafafa' }}>
      <div ref={ref} className="landing-fade" style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: 'clamp(28px, 4vw, 48px)',
          fontWeight: 600,
          letterSpacing: '-1px',
          lineHeight: 1.15,
          textAlign: 'center',
          marginBottom: '48px'
        }}>
          Questions{' '}
          <span style={{ fontStyle: 'italic', fontWeight: 400 }}>fréquentes</span>
        </h2>

        {faqs.map((item, i) => (
          <FAQItem key={i} q={item.q} a={item.a} />
        ))}
      </div>
    </section>
  );
}