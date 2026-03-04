import React, { useState, useEffect, useRef } from 'react';

const offers = [
  { key: 'principal', label: "Offre d'entrée", price: 27, color: '#f97316', max: 50, defaultSales: 10 },
  { key: 'bump', label: 'Petit extra', price: 17, color: '#a78bfa', max: 50, defaultSales: 5 },
  { key: 'upsell', label: 'Offre supérieure', price: 197, color: '#3b82f6', max: 30, defaultSales: 3 },
  { key: 'premium', label: 'Offre premium', price: 1500, color: '#ec4899', max: 10, defaultSales: 1 },
];

export default function LandingCalculator() {
  const ref = useRef(null);
  const [sales, setSales] = useState({
    principal: 10, bump: 5, upsell: 3, premium: 1,
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
    <div ref={ref} className="landing-fade" style={{
      background: '#fff',
      padding: '0 24px 80px',
    }}>
      <div style={{
        maxWidth: '700px',
        margin: '0 auto',
        background: '#111',
        borderRadius: '24px',
        padding: 'clamp(28px, 5vw, 48px)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', top: '40%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px', height: '250px',
          background: 'radial-gradient(ellipse, rgba(167,139,250,0.1) 0%, rgba(249,115,22,0.06) 40%, transparent 70%)',
          pointerEvents: 'none', filter: 'blur(50px)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h3 style={{
            textAlign: 'center',
            fontSize: 'clamp(20px, 3.5vw, 28px)',
            fontWeight: 500,
            lineHeight: 1.3,
            letterSpacing: '-0.02em',
            color: '#fff',
            marginBottom: '6px',
          }}>
            Combien peux-tu{' '}
            <span style={{
              fontStyle: 'italic',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>gagner</span>{' '}par mois ?
          </h3>
          <p style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.35)',
            fontSize: '14px',
            marginBottom: '32px',
          }}>
            Ajuste le nombre de ventes pour chaque offre.
          </p>

          {/* Sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {offers.map(o => {
              const revenue = sales[o.key] * o.price;
              const pct = (sales[o.key] / o.max) * 100;
              return (
                <div key={o.key} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  padding: '16px 20px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: o.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{o.label}</span>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>· {o.price}€</span>
                    </div>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: o.color }}>{revenue.toLocaleString('fr-FR')}€</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="range" min="0" max={o.max}
                      value={sales[o.key]}
                      onChange={e => setSales(prev => ({ ...prev, [o.key]: Number(e.target.value) }))}
                      className={`calc-slider calc-slider-${o.key}`}
                      style={{
                        flex: 1, height: '4px', appearance: 'none',
                        background: `linear-gradient(to right, ${o.color} 0%, ${o.color} ${pct}%, rgba(255,255,255,0.1) ${pct}%, rgba(255,255,255,0.1) 100%)`,
                        borderRadius: '100px', outline: 'none', cursor: 'pointer',
                      }}
                    />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', minWidth: '52px', textAlign: 'right' }}>
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
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px', fontWeight: 500 }}>
              Revenus mensuels estimés
            </p>
            <p style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              margin: '0 0 4px',
              background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {total.toLocaleString('fr-FR')}€<span style={{ fontSize: '20px', fontWeight: 400 }}>/mois</span>
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
              Soit {(total * 12).toLocaleString('fr-FR')}€ par an
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .calc-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px; height: 16px; border-radius: 50%;
          background: #fff; cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .calc-slider::-moz-range-thumb {
          width: 16px; height: 16px; border-radius: 50%;
          background: #fff; cursor: pointer; border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}