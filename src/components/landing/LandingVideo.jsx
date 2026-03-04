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
      position: 'relative',
    }}>
      {/* Neon circles behind video */}
      <div className="neon-circle neon-circle-1" />
      <div className="neon-circle neon-circle-2" />
      <div className="neon-circle neon-circle-3" />

      <style>{`
        .neon-circle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          filter: blur(45px);
          opacity: 0.75;
        }
        .neon-circle-1 {
          width: min(320px, 60vw); height: min(320px, 60vw);
          background: radial-gradient(circle, rgba(249,115,22,0.6) 0%, transparent 70%);
          top: 10%; left: -5%;
          animation: neonFloat1 6s ease-in-out infinite;
        }
        .neon-circle-2 {
          width: min(260px, 50vw); height: min(260px, 50vw);
          background: radial-gradient(circle, rgba(236,72,153,0.55) 0%, transparent 70%);
          top: 30%; right: -3%;
          animation: neonFloat2 7s ease-in-out infinite;
        }
        .neon-circle-3 {
          width: min(250px, 48vw); height: min(250px, 48vw);
          background: radial-gradient(circle, rgba(167,139,250,0.55) 0%, transparent 70%);
          bottom: 5%; left: 15%;
          animation: neonFloat3 8s ease-in-out infinite;
        }
        @keyframes neonFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -15px) scale(1.08); }
        }
        @keyframes neonFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-15px, 20px) scale(1.05); }
        }
        @keyframes neonFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(15px, 12px) scale(1.1); }
        }
      `}</style>

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
        zIndex: 1,
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