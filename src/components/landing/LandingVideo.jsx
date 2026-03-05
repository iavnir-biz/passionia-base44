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

      {/* Video frame — Vimeo embed */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        borderRadius: '20px',
        overflow: 'hidden',
        border: '1px solid #e8e8e8',
        boxShadow: '0 24px 80px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
        background: '#000',
        aspectRatio: '16 / 9',
      }}>
        <iframe
          src="https://player.vimeo.com/video/1170810950?badge=0&autopause=0&player_id=0&app_id=58479"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
          allowFullScreen
          title="NOAH™ Démo"
        />
      </div>
    </section>
  );
}