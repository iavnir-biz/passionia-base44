import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus } from 'lucide-react';

function FAQItem({ number, question, answer, isOpen, onToggle }) {
  return (
    <div style={{ borderBottom: '1px solid #e5e5e5' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: 'none',
          border: 'none',
          padding: '22px 0',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'inherit'
        }}
      >
        <span style={{
          fontSize: '13px',
          fontWeight: 600,
          color: isOpen ? '#1a1a1a' : '#bbb',
          background: isOpen ? '#1a1a1a' : 'transparent',
          color: isOpen ? '#fff' : '#bbb',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.3s ease',
          border: isOpen ? 'none' : '1px solid #ddd',
        }}>{number}</span>
        <span style={{
          fontSize: '16px',
          fontWeight: 500,
          color: '#1a1a1a',
          flex: 1,
        }}>{question}</span>
        <div style={{
          flexShrink: 0,
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {isOpen ? (
            <Minus size={18} color="#1a1a1a" strokeWidth={2} />
          ) : (
            <Plus size={18} color="#999" strokeWidth={2} />
          )}
        </div>
      </button>
      <div style={{
        maxHeight: isOpen ? '500px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.4s ease',
      }}>
        <p style={{
          fontSize: '15px',
          color: '#666',
          lineHeight: 1.7,
          paddingBottom: '24px',
          paddingLeft: '44px',
          margin: 0,
        }}>
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function LandingFAQ() {
  const ref = useRef(null);
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) e.target.classList.add('visible'); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const faqs = [
    { q: "J'ai besoin de compétences techniques ?", a: "Non. NOAH™ te guide pas à pas. Tu n'as qu'à répondre aux questions et copier-coller les contenus générés." },
    { q: "Combien de temps pour voir des résultats ?", a: "La génération prend 5 minutes. Avec le plan d'action, tu peux faire ta première vente en 24h à 7 jours." },
    { q: "Mon domaine est-il compatible ?", a: "Si tu as une expertise que d'autres veulent apprendre (cuisine, langues, fitness, business, créativité...), oui." },
    { q: "C'est un abonnement ?", a: "Non. Paiement unique de 29€, accès à vie, mises à jour incluses." },
    { q: "Et si ça ne marche pas ?", a: "Tu as 30 jours pour tester. Si tu n'es pas satisfait, tu es remboursé intégralement — sans justification." }
  ];

  return (
    <section ref={ref} className="landing-fade" style={{
      padding: '100px 24px',
      background: '#f5f5f5'
    }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 400,
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          textAlign: 'center',
          marginBottom: '56px',
          fontStyle: 'italic',
        }}>
          Frequently<br />asked questions
        </h2>

        {faqs.map((f, i) => (
          <FAQItem
            key={i}
            number={i + 1}
            question={f.q}
            answer={f.a}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
          />
        ))}
      </div>
    </section>
  );
}