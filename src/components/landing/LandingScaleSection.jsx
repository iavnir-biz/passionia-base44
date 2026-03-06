import React, { useEffect, useRef } from 'react';

// Payment method icon components
const VisaBadge = () => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: '#1434CB', color: '#fff', fontSize: '8px', fontWeight: 800,
    fontStyle: 'italic', letterSpacing: '-0.3px', borderRadius: '3px',
    padding: '2px 5px', lineHeight: 1.3, flexShrink: 0,
  }}>VISA</span>
);

const MastercardBadge = () => (
  <span style={{ display: 'inline-flex', alignItems: 'center', position: 'relative', width: '22px', height: '14px', flexShrink: 0 }}>
    <span style={{ position: 'absolute', left: 0, width: '14px', height: '14px', borderRadius: '50%', background: '#EB001B', opacity: 0.95 }} />
    <span style={{ position: 'absolute', left: '8px', width: '14px', height: '14px', borderRadius: '50%', background: '#F79E1B', opacity: 0.9 }} />
  </span>
);

const AppleBadge = () => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: '#000', color: '#fff', fontSize: '10px',
    borderRadius: '3px', padding: '1px 5px', lineHeight: 1.4, flexShrink: 0,
  }}></span>
);

const KlarnaBadge = () => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: '#ffb3c7', color: '#000', fontSize: '9px', fontWeight: 800,
    borderRadius: '3px', padding: '2px 6px', lineHeight: 1.3, flexShrink: 0,
  }}>K</span>
);

const StripeIconBadge = () => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: '#635BFF', color: '#fff', fontSize: '8px', fontWeight: 700,
    borderRadius: '3px', padding: '2px 5px', lineHeight: 1.3, flexShrink: 0,
  }}>S</span>
);

const METHOD_BADGES = {
  visa: <VisaBadge />,
  mastercard: <MastercardBadge />,
  apple: <AppleBadge />,
  klarna: <KlarnaBadge />,
  stripe: <StripeIconBadge />,
};

const StatusBadge = ({ label }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: '3px',
    background: '#dcfce7', color: '#16a34a', fontSize: '10px', fontWeight: 600,
    borderRadius: '100px', padding: '2px 8px', border: '1px solid #bbf7d0',
    flexShrink: 0, whiteSpace: 'nowrap',
  }}>
    {label} <span style={{ fontSize: '9px' }}>&#10003;</span>
  </span>
);

const payments = [
  { amount: '97,00 €', currency: 'EUR', methods: ['apple', 'mastercard'], suffix: '···· 57' },
  { amount: '47,00 €', currency: 'EUR', methods: ['apple', 'mastercard'], suffix: '···· 57' },
  { amount: '27,00 €', currency: 'EUR', methods: ['apple', 'mastercard'], suffix: '···· 57' },
  { amount: '27,00 €', currency: 'EUR', methods: ['visa'], suffix: '···· 2830' },
  { amount: '27,00 €', currency: 'EUR', methods: ['visa'], suffix: '···· 3762' },
  { amount: '17,00 €', currency: 'EUR', methods: ['stripe', 'mastercard'], suffix: '···· 93' },
  { amount: '97,00 €', currency: 'EUR', methods: ['stripe', 'visa'], suffix: '···· 93' },
  { amount: '17,00 €', currency: 'EUR', methods: ['apple', 'visa'], suffix: '···· 22' },
  { amount: '31,00 €', currency: 'EUR', methods: ['visa'], suffix: '···· 4868' },
  { amount: '1 738,00 €', currency: 'EUR', methods: ['visa', 'visa'], suffix: '···· 72' },
  { amount: '1 738,00 €', currency: 'EUR', methods: ['apple', 'visa'], suffix: '····' },
  { amount: '1 197,00 €', currency: 'EUR', methods: ['visa'], suffix: '···· 86' },
  { amount: '1 197,00 €', currency: 'EUR', methods: ['klarna'], suffix: 'Klarna' },
  { amount: '997,00 €', currency: 'EUR', methods: ['visa'], suffix: '···· 000' },
  { amount: '2 000,00 €', currency: 'EUR', methods: ['visa'], suffix: '···· 97' },
  { amount: '2 000,00 €', currency: 'EUR', methods: ['apple', 'visa'], suffix: '···· 65' },
];

const PaymentRow = ({ amount, currency, methods, suffix }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '8px 12px',
    background: '#fff', borderRadius: '8px',
    border: '1px solid #f0f0f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    fontSize: '12px', fontWeight: 600, color: '#1a1a1a',
    width: '100%', boxSizing: 'border-box',
  }}>
    <span style={{ minWidth: '72px', fontVariantNumeric: 'tabular-nums' }}>{amount}</span>
    <span style={{ color: '#999', fontSize: '10px', fontWeight: 500 }}>{currency}</span>
    <StatusBadge label="Réussi" />
    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: 'auto' }}>
      {methods.map((m, i) => <span key={i}>{METHOD_BADGES[m]}</span>)}
    </span>
    <span style={{ color: '#bbb', fontSize: '11px', minWidth: '52px', textAlign: 'right' }}>{suffix}</span>
  </div>
);

const tiers = [
  {
    priceRange: '17€ – 27€',
    frequency: '1 vente tous les 2 jours',
    monthly: '≈ 405€ / mois',
    description: 'Petit produit accessible · Première marche',
    tag: 'OFFRE PRINCIPALE',
  },
  {
    priceRange: '97€ – 287€',
    frequency: '2 ventes / mois',
    monthly: '≈ 400€ – 600€ / mois',
    description: 'Pour ceux qui veulent aller plus loin',
    tag: 'OFFRE INTERMÉDIAIRE',
  },
  {
    priceRange: '1000€ – 2000€',
    frequency: '1 à 2 ventes / mois',
    monthly: '1000€ à 4000€ / mois',
    description: 'Accompagnement plus profond',
    tag: 'OFFRE PREMIUM',
  },
];

function TierCard({ tier, delay }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const timeout = setTimeout(() => {
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) el.classList.add('scale-tier-visible');
      }, { threshold: 0.1 });
      obs.observe(el);
      return () => obs.disconnect();
    }, delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  return (
    <div ref={ref} className="scale-tier" style={{
      flex: '1 1 200px',
      minWidth: '200px',
      background: '#1a1a1a',
      border: '1.5px solid #333',
      borderRadius: '20px',
      padding: '24px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      {/* Tag */}
      <span style={{
        display: 'inline-flex', alignSelf: 'flex-start',
        background: 'rgba(255,255,255,0.1)', color: '#fff',
        fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em',
        borderRadius: '100px', padding: '3px 10px',
        border: '1px solid rgba(255,255,255,0.15)',
      }}>{tier.tag}</span>

      {/* Price range */}
      <div style={{
        fontSize: 'clamp(20px, 2.5vw, 26px)',
        fontWeight: 800,
        background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        letterSpacing: '-0.02em',
        lineHeight: 1.1,
        display: 'inline-block',
      }}>{tier.priceRange}</div>

      {/* Frequency */}
      <div style={{
        fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.7)',
        lineHeight: 1.4,
      }}>{tier.frequency}</div>

      {/* Monthly */}
      <div style={{
        fontSize: 'clamp(15px, 1.8vw, 18px)',
        fontWeight: 700,
        color: '#fff',
        lineHeight: 1.3,
      }}>{tier.monthly}</div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

      {/* Description */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        padding: '10px 12px',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.5)',
        fontWeight: 500,
        lineHeight: 1.5,
        textAlign: 'center',
      }}>{tier.description}</div>
    </div>
  );
}

export default function LandingScaleSection() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const totalRef = useRef(null);
  const paymentRef = useRef(null);

  useEffect(() => {
    const refs = [sectionRef, titleRef, totalRef, paymentRef];
    const observers = refs.map((r, i) => {
      if (!r.current) return null;
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) r.current?.classList.add('visible');
      }, { threshold: 0.1 });
      obs.observe(r.current);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  // Duplicate for seamless scroll
  const allPayments = [...payments, ...payments];

  return (
    <section style={{ background: '#fff', padding: '0 24px 80px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div ref={titleRef} className="landing-fade" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{
            fontSize: 'clamp(26px, 4vw, 42px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#1a1a1a',
            marginBottom: '12px',
            lineHeight: 1.15,
          }}>
            Une échelle simple.{' '}
            <span style={{
              fontStyle: 'italic',
              background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'inline-block',
              paddingRight: '0.2em',
              marginRight: '-0.2em',
            }}>3 niveaux.</span>
          </h2>
          <p style={{ fontSize: '15px', color: '#666', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto' }}>
            Tu n'as pas besoin de 1000 clients.<br />
            Tu as besoin d'une structure.
          </p>
        </div>

        {/* Tier cards */}
        <div ref={sectionRef} className="landing-fade" style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '24px',
          alignItems: 'stretch',
        }}>
          {tiers.map((tier, i) => (
            <TierCard key={i} tier={tier} delay={i * 100} />
          ))}
        </div>

        {/* Total box */}
        <div ref={totalRef} className="landing-fade" style={{
          background: '#f8f8f8',
          border: '1.5px solid #e8e8e8',
          borderRadius: '20px',
          padding: '28px 32px',
          textAlign: 'center',
          marginBottom: '48px',
        }}>
          <p style={{ fontSize: 'clamp(18px, 2.5vw, 26px)', fontWeight: 800, color: '#1a1a1a', marginBottom: '6px', letterSpacing: '-0.02em' }}>
            Total possible :{' '}
            <span style={{
              background: 'linear-gradient(135deg, #f97316, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'inline-block',
            }}>2 000€ à 4 500€ / mois</span>
          </p>
          <p style={{ fontSize: '14px', color: '#888', margin: 0, fontWeight: 400 }}>
            Ce n'est pas magique. C'est une échelle logique.
          </p>
        </div>

        {/* Payment feed section */}
        <div ref={paymentRef} className="landing-fade">
          <p style={{
            textAlign: 'center',
            fontSize: 'clamp(15px, 2vw, 18px)',
            fontWeight: 700,
            color: '#1a1a1a',
            marginBottom: '24px',
            letterSpacing: '-0.01em',
          }}>
            Des petites ventes.{' '}
            <span style={{ color: '#1a1a1a' }}>Des moyennes ventes.</span>{' '}
            <span style={{
              background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'inline',
            }}>Des premium.</span>
          </p>

          {/* Stripe-style scrolling feed */}
          <div style={{
            position: 'relative',
            background: '#f9f9f9',
            border: '1.5px solid #ebebeb',
            borderRadius: '20px',
            padding: '0',
            overflow: 'hidden',
            height: '320px',
          }}>
            {/* Top fade */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '60px',
              background: 'linear-gradient(to bottom, #f9f9f9, transparent)',
              zIndex: 2, pointerEvents: 'none',
            }} />
            {/* Bottom fade */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px',
              background: 'linear-gradient(to top, #f9f9f9, transparent)',
              zIndex: 2, pointerEvents: 'none',
            }} />

            {/* Stripe header overlay */}
            <div style={{
              position: 'absolute', top: '12px', left: '12px',
              background: '#635BFF', color: '#fff',
              borderRadius: '8px', padding: '4px 10px',
              fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em',
              zIndex: 3,
            }}>
              STRIPE · PAIEMENTS EN DIRECT
            </div>

            {/* Scrolling list */}
            <div className="scale-payment-scroll" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              padding: '48px 16px 16px',
              animation: 'scaleScrollUp 28s linear infinite',
            }}>
              {allPayments.map((p, i) => (
                <PaymentRow key={i} {...p} />
              ))}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .scale-tier {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .scale-tier-visible {
          opacity: 1;
          transform: translateY(0);
        }
        @keyframes scaleScrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .scale-payment-scroll:hover {
          animation-play-state: paused;
        }
        @media (max-width: 600px) {
          .scale-tier {
            min-width: 100% !important;
          }
        }
      `}</style>
    </section>
  );
}