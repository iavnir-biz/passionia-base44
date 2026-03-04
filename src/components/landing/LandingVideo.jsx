import React, { useEffect, useRef } from 'react';
import { Play } from 'lucide-react';

export default function LandingVideo() {
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) e.target.classList.add('visible'); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="landing-fade" style={{
      padding: '0 24px 80px',
      maxWidth: '900px',
      margin: '0 auto',
    }}>
      {/* Label */}
      <p style={{
        textAlign: 'center',
        fontSize: '13px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        color: '#999',
        marginBottom: '20px',
      }}>
        Vois NOAH™ en action
      </p>

      {/* Video frame — Amplemarket style */}
      <div style={{
        position: 'relative',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '1px solid #e8e8e8',
        boxShadow: '0 24px 80px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
        background: '#f5f5f5',
        aspectRatio: '16 / 9',
        cursor: 'pointer',
      }}>
        {/* Gradient placeholder background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 50%, #ebebeb 100%)',
        }} />

        {/* Subtle grid pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, #d0d0d0 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.5,
        }} />

        {/* Center play button */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
            onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.28)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)'; }}
          >
            <Play size={28} color="#fff" fill="#fff" style={{ marginLeft: '4px' }} />
          </div>
          <span style={{
            fontSize: '14px',
            color: '#888',
            fontWeight: 500,
          }}>
            Démo produit · 2 min
          </span>
        </div>

        {/* Top-left label */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          background: 'rgba(255,255,255,0.9)',
          border: '1px solid rgba(0,0,0,0.06)',
          borderRadius: '100px',
          padding: '4px 12px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#1a1a1a',
          backdropFilter: 'blur(8px)',
        }}>
          NOAH™
        </div>
      </div>
    </section>
  );
}
