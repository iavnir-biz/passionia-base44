import React, { useState, useEffect, useRef } from 'react';

const offers = [
  { key: 'principal', label: "Offre d'entrée", price: 27, color: '#f97316', defaultSales: 10 },
  { key: 'bump', label: 'Petit extra', price: 17, color: '#a78bfa', defaultSales: 5 },
  { key: 'upsell', label: 'Offre supérieure', price: 197, color: '#3b82f6', defaultSales: 3 },
  { key: 'premium', label: 'Offre premium', price: 1500, color: '#ec4899', defaultSales: 1 },
];

export default function LandingCalculator() {
  const ref = useRef(null);
  const [sales, setSales] = useState({
    principal: 10,
    bump: 5,
    upsell: 3,
    premium: 1,
  });

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) e.target.classList.add('visible');
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const total = offers.reduce((sum, o) => sum + (sales[o.key] * o.price), 0);

  return (
    <section ref={ref} className="landing-fade" style={{
      background: '#111111',
      padding: '80px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        height: '350px',
        background: 'radial-gradient(ellipse, rgba(167,139,250,0.12) 0%, rgba(249,115,22,0.08) 40%, transparent 70%)',
        pointerEvents: 'none',
        filter: 'blur(60px)',
      }} />

      <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Badge */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '100px',
            padding: '6px 18px',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}>Simulateur</div>
        </div>

        <h2 style={{
          textAlign: 'center',
          fontSize: 'clamp(24px, 4vw, 40px)',
          fontWeight: 400,
          lineHeight: 1.2,
          letterSpacing: '-0.03em',
          color: '#fff',
          marginBottom: '12px',
        }}>
          Combien peux-tu{' '}
          <span style={{
            fontStyle: 'italic',
            fontWeight: 500,
            background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>gagner</span>{' '}par mois ?
        </h2>
        <p style={{
          textAlign: 'center',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '15px',
          marginBottom: '48px',
          lineHeight: 1.6,
        }}>
          Ajuste le nombre de ventes mensuelles pour chaque offre.
        </p>

        {/* Sliders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
          {offers.map(o => {
            const revenue = sales[o.key] * o.price;
            return (
              <div key={o.key} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '20px 24px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      width: '10px', height: '10px', borderRadius: '50%',
                      background: o.color, flexShrink: 0,
                    }} />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{o.label}</span>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>· {o.price}€</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: o.color }}>{revenue.toLocaleString('fr-FR')}€</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <input
                    type="range"
                    min="0"
                    max={o.key === 'premium' ? 10 : o.key === 'upsell' ? 30 : 50}
                    value={sales[o.key]}
                    onChange={e => setSales(prev => ({ ...prev, [o.key]: Number(e.target.value) }))}
                    style={{
                      flex: 1,
                      height: '4px',
                      appearance: 'none',
                      background: `linear-gradient(to right, ${o.color} 0%, ${o.color} ${(sales[o.key] / (o.key === 'premium' ? 10 : o.key === 'upsell' ? 30 : 50)) * 100}%, rgba(255,255,255,0.1) ${(sales[o.key] / (o.key === 'premium' ? 10 : o.key === 'upsell' ? 30 : 50)) * 100}%, rgba(255,255,255,0.1) 100%)`,
                      borderRadius: '100px',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  />
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#fff',
                    minWidth: '50px',
                    textAlign: 'right',
                  }}>
                    {sales[o.key]} vente{sales[o.key] > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '20px',
          padding: '28px 32px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', fontWeight: 500 }}>
            Revenus mensuels estimés
          </p>
          <p style={{
            fontSize: 'clamp(36px, 6vw, 56px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            margin: 0,
            background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {total.toLocaleString('fr-FR')}€<span style={{ fontSize: '24px', fontWeight: 400 }}>/mois</span>
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginTop: '12px' }}>
            Soit {(total * 12).toLocaleString('fr-FR')}€ par an
          </p>
        </div>
      </div>

      {/* Slider thumb style */}
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
      `}</style>
    </section>
  );
}