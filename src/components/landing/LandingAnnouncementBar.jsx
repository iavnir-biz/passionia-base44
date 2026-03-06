import React, { useState, useEffect } from 'react';
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
        background: '#1a1a1a',
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
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        {/* Promo text */}
        <span className="announce-text" style={{ opacity: 0.95 }}>
          🔥 <strong>-20€ immédiat</strong> — Offre valable jusqu'à minuit
        </span>

        {/* Timer */}
        <div style={{
          display: 'inline-flex', gap: '4px', alignItems: 'center',
          background: 'rgba(255,255,255,0.1)', borderRadius: '8px',
          padding: '3px 10px', fontSize: '13px', fontWeight: 700,
          fontVariantNumeric: 'tabular-nums', letterSpacing: '0.5px'
        }}>
          <span>{pad(timeLeft.hours)}</span>
          <span style={{ opacity: 0.5 }}>:</span>
          <span>{pad(timeLeft.minutes)}</span>
          <span style={{ opacity: 0.5 }}>:</span>
          <span>{pad(timeLeft.seconds)}</span>
        </div>

        {/* CTA */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="announce-cta"
          style={{
            background: '#61f7a2',
            border: 'none',
            color: '#1a1a1a', padding: '5px 16px', borderRadius: '100px',
            fontSize: '12px', fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.2s', whiteSpace: 'nowrap', letterSpacing: '0.3px'
          }}
          onMouseOver={e => e.target.style.background = '#4de08e'}
          onMouseOut={e => e.target.style.background = '#61f7a2'}
        >
          RECUPERER ma réduction
        </button>

        <style>{`
          @media (max-width: 480px) {
            .announce-text { font-size: 11px !important; }
            .announce-cta { display: none !important; }
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
