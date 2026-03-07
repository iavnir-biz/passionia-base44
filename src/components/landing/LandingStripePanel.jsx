import React, { useEffect, useRef } from 'react';

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

const AppleBadge = () => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: '#000', color: '#fff', fontSize: '10px',
    borderRadius: '3px', padding: '1px 5px', lineHeight: 1.4, flexShrink: 0,
  }}></span>
);

const METHOD_BADGES = {
  visa: <VisaBadge />,
  mastercard: <MastercardBadge />,
  apple: <AppleBadge />,
  klarna: <KlarnaBadge />,
  stripe: <StripeIconBadge />,
};

const StatusBadge = () => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: '3px',
    background: '#dcfce7', color: '#16a34a', fontSize: '10px', fontWeight: 600,
    borderRadius: '100px', padding: '2px 8px', border: '1px solid #bbf7d0',
    flexShrink: 0, whiteSpace: 'nowrap',
  }}>
    Réussi <span style={{ fontSize: '9px' }}>&#10003;</span>
  </span>
);

const payments = [
  { amount: '1 197,00 €', currency: 'EUR', methods: ['visa'], suffix: '···· 86' },
  { amount: '1 197,00 €', currency: 'EUR', methods: ['klarna'], suffix: 'Klarna' },
  { amount: '997,00 €', currency: 'EUR', methods: ['visa'], suffix: '···· 000' },
  { amount: '2 000,00 €', currency: 'EUR', methods: ['visa'], suffix: '···· 97' },
  { amount: '2 000,00 €', currency: 'EUR', methods: ['apple', 'visa'], suffix: '···· 65' },
  { amount: '97,00 €', currency: 'EUR', methods: ['mastercard'], suffix: '···· 57' },
  { amount: '47,00 €', currency: 'EUR', methods: ['visa'], suffix: '···· 2830' },
  { amount: '27,00 €', currency: 'EUR', methods: ['visa'], suffix: '···· 3762' },
  { amount: '1 738,00 €', currency: 'EUR', methods: ['visa'], suffix: '···· 72' },
  { amount: '97,00 €', currency: 'EUR', methods: ['stripe', 'visa'], suffix: '···· 93' },
  { amount: '27,00 €', currency: 'EUR', methods: ['apple', 'mastercard'], suffix: '···· 57' },
  { amount: '17,00 €', currency: 'EUR', methods: ['stripe', 'mastercard'], suffix: '···· 93' },
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
    <StatusBadge />
    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: 'auto' }}>
      {methods.map((m, i) => <span key={i}>{METHOD_BADGES[m]}</span>)}
    </span>
    <span style={{ color: '#bbb', fontSize: '11px', minWidth: '52px', textAlign: 'right' }}>{suffix}</span>
  </div>
);

export default function LandingStripePanel() {
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) e.target.classList.add('visible'); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const allPayments = [...payments, ...payments];

  return (
    <div ref={ref} className="landing-fade" style={{ padding: '0 24px', maxWidth: '820px', margin: '0 auto 40px' }}>
      <div style={{
        position: 'relative',
        background: '#f9f9f9',
        border: '1.5px solid #ebebeb',
        borderRadius: '20px',
        overflow: 'hidden',
        height: '300px',
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

        {/* Stripe header */}
        <div style={{
          position: 'absolute', top: '12px', left: '12px',
          background: '#635BFF', color: '#fff',
          borderRadius: '8px', padding: '4px 10px',
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em',
          zIndex: 3, display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          STRIPE · PAIEMENTS EN DIRECT
          <span style={{
            background: 'rgba(255,255,255,0.2)', borderRadius: '3px',
            padding: '1px 5px', fontSize: '9px', fontWeight: 700,
            fontStyle: 'italic',
          }}>VISA</span>
        </div>

        {/* Scrolling list */}
        <div className="stripe-panel-scroll" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          padding: '48px 16px 16px',
          animation: 'stripePanelScrollUp 24s linear infinite',
        }}>
          {allPayments.map((p, i) => (
            <PaymentRow key={i} {...p} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes stripePanelScrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .stripe-panel-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
