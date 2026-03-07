import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import DiscountCodeSidebar from './DiscountCodeSidebar';

export default function LandingAnnouncementBar({ onScrollToCTA }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const getEndOfDay = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return end;
    };

    const update = () => {
      const now = new Date();
      const end = getEndOfDay();
      const diff = Math.max(0, end - now);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <>
      <div style={{
        background: '#111111',
        color: '#fff',
        textAlign: 'center',
        padding: '10px 16px',
        fontSize: '14px',
        fontWeight: 500,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        {/* Promo text */}
        <span className="announce-text" style={{ opacity: 0.9, fontSize: '13px' }}>
          <Zap size={14} style={{ display: 'inline-block', verticalAlign: 'middle', fill: '#fff', color: '#fff', marginRight: '4px' }} />
          <strong style={{ color: '#fff' }}>-20€ immédiat</strong>
          <span style={{ color: 'rgba(255,255,255,0.55)', marginLeft: '6px' }}>— Offre valable jusqu'à minuit</span>
        </span>

        {/* Timer */}
        <div className="announce-timer" style={{
          display: 'inline-flex', gap: '3px', alignItems: 'center',
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '4px 12px', fontSize: '13px', fontWeight: 700,
          fontVariantNumeric: 'tabular-nums', letterSpacing: '0.5px', color: '#fff',
        }}>
          <span>{pad(timeLeft.hours)}</span>
          <span style={{ opacity: 0.35 }}>:</span>
          <span>{pad(timeLeft.minutes)}</span>
          <span style={{ opacity: 0.35 }}>:</span>
          <span>{pad(timeLeft.seconds)}</span>
        </div>

        {/* CTA */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="announce-cta"
          style={{
            background: '#fff',
            border: 'none',
            color: '#111', padding: '6px 18px', borderRadius: '100px',
            fontSize: '11px', fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.2s', whiteSpace: 'nowrap', letterSpacing: '0.3px',
            textTransform: 'uppercase',
          }}
          onMouseOver={e => e.target.style.opacity = '0.85'}
          onMouseOut={e => e.target.style.opacity = '1'}
        >
          Récupérer ma réduction
        </button>

        <style>{`
          @media (max-width: 480px) {
            .announce-text { font-size: 11px !important; }
            .announce-timer { display: none !important; }
          }
        `}</style>
      </div>

      <DiscountCodeSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </>
  );
}