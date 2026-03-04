import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #eee' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          padding: '20px 0',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'inherit'
        }}
      >
        <span style={{ fontSize: '16px', fontWeight: 500, color: '#1a1a1a', paddingRight: '16px' }}>{question}</span>
        <ChevronDown
          size={18}
          color="#999"
          style={{
            transition: 'transform 0.3s',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            flexShrink: 0
          }}
        />
      </button>
      <div style={{
        maxHeight: open ? '200px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.3s ease'
      }}>
        <p style={{ fontSize: '15px', color: '#888', lineHeight: 1.6, paddingBottom: '20px' }}>
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function LandingFAQ() {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) e.target.classList.add('visible'); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const faqs = [
    { q: "J'ai besoin de compétences techniques ?", a: "Non. NOAH™ te guide pas à pas. Tu n'as qu'à répondre aux questions et copier-coller les contenus générés." },
    { q: "Combien de temps pour voir des résultats ?", a: "La génération prend 5 minutes. Avec le plan d'action, tu peux faire ta première vente en 24h à 7 jours." },
    { q: "Mon domaine est-il compatible ?", a: "Si tu as une expertise que d'autres veulent apprendre (cuisine, langues, fitness, business, créativité...), oui." },
    { q: "C'est un abonnement ?", a: "Non. Paiement unique de 47€, accès à vie, mises à jour incluses." },
    { q: "Et si ça ne marche pas ?", a: "Tu as 30 jours pour tester. Si tu n'es pas satisfait, tu es remboursé intégralement — sans justification." }
  ];

  return (
    <section ref={ref} className="landing-fade" style={{
      padding: '80px 24px',
      background: '#fafafa'
    }}>
      <div style={{ maxWidth: '650px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: 400,
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
          textAlign: 'center',
          marginBottom: '48px'
        }}>
          Questions fréquentes
        </h2>

        {faqs.map((f, i) => (
          <FAQItem key={i} question={f.q} answer={f.a} />
        ))}
      </div>
    </section>
  );
}