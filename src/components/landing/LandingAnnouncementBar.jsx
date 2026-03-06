import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

export default function LandingAnnouncementBar({ onScrollToCTA }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [copied, setCopied] = useState(false);

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

  const handleCopy = () => {
    navigator.clipboard.writeText('noah20');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
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

      {/* Code promo */}
      <button
        onClick={handleCopy}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: copied ? 'rgba(97,247,162,0.2)' : 'rgba(255,255,255,0.1)',
          border: `1px dashed ${copied ? 'rgba(97,247,162,0.6)' : 'rgba(255,255,255,0.3)'}`,
          color: '#fff', padding: '3px 12px', borderRadius: '8px',
          fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        Code : <span style={{ color: '#61f7a2', fontWeight: 700 }}>noah20</span>
        {copied ? <Check size={13} style={{ color: '#61f7a2' }} /> : <Copy size={13} style={{ opacity: 0.6 }} />}
      </button>

      {/* CTA */}
      <button
        onClick={onScrollToCTA}
        className="announce-cta"
        style={{
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.25)',
          color: '#fff', padding: '4px 14px', borderRadius: '100px',
          fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          transition: 'all 0.2s', whiteSpace: 'nowrap'
        }}
        onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.25)'}
        onMouseOut={e => e.target.style.background = 'rgba(255,255,255,0.15)'}
      >
        Voir l'offre →
      </button>

      <style>{`
        @media (max-width: 480px) {
          .announce-text { font-size: 11px !important; }
          .announce-cta { display: none !important; }
        }
      `}</style>
    </div>
  );
}