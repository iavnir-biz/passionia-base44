import React, { useEffect, useRef } from 'react';
import { Zap, FileText, Mail, MessageSquare, Users, Clock } from 'lucide-react';

const marqueeItems = [
  { text: "1 offre d'entrée (7€–37€)", color: "#f97316" },
  { text: "1 offre en extra (7€–27€)", color: "#a78bfa" },
  { text: "1 offre intermédiaire (97€–297€)", color: "#3b82f6" },
  { text: "1 offre premium (1 000€–3 000€)", color: "#ec4899" },
  { text: "1 structure d'ascension claire", color: "#10b981" },
  { text: "Messages de vente déjà rédigés", color: "#f59e0b" },
  { text: "Plan d'action 7 jours", color: "#6366f1" },
  { text: "Validation marché par IA", color: "#14b8a6" },
  { text: "Accès à vie + mises à jour", color: "#f43f5e" },
];

function MarqueeRow({ items, direction = 'left', duration = 30 }) {
  const doubled = [...items, ...items, ...items];
  return (
    <div style={{ overflow: 'hidden', width: '100%', padding: '6px 0' }}>
      <div style={{
        display: 'flex',
        gap: '12px',
        width: 'max-content',
        animation: `marquee-${direction} ${duration}s linear infinite`,
      }}>
        {doubled.map((item, i) => (
          <div key={i} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '100px',
            padding: '8px 18px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: item.color,
              flexShrink: 0,
            }} />
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingSolution() {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) e.target.classList.add('visible'); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const features = [
    { icon: <Zap size={22} />, title: "4 offres structurées", desc: "Produit, bump, upsell et premium — avec les prix optimaux." },
    { icon: <FileText size={22} />, title: "Pages de vente", desc: "Textes persuasifs générés, prêts à copier-coller." },
    { icon: <Mail size={22} />, title: "Séquence emails", desc: "5 emails de vente pour convertir tes prospects." },
    { icon: <MessageSquare size={22} />, title: "Messages de vente", desc: "Scripts pour réseaux sociaux et conversations." },
    { icon: <Users size={22} />, title: "Avatars clients", desc: "Profils détaillés de tes clients idéaux." },
    { icon: <Clock size={22} />, title: "Plan d'action 7 jours", desc: "Étape par étape, une action par jour." }
  ];

  return (
    <section ref={ref} className="landing-fade" style={{
      padding: '100px 24px',
      background: '#111111',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle glow */}
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '400px',
        background: 'radial-gradient(ellipse, rgba(167,139,250,0.12) 0%, rgba(249,115,22,0.08) 40%, transparent 70%)',
        pointerEvents: 'none',
        filter: 'blur(60px)',
      }} />

      <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Badge */}
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
          marginBottom: '28px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}>La solution</div>

        <h2 style={{
          fontSize: 'clamp(28px, 4.5vw, 52px)',
          fontWeight: 400,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          marginBottom: '16px',
          color: '#fff',
        }}>
          NOAH™ fait{' '}
          <span style={{
            fontStyle: 'italic',
            fontWeight: 500,
            background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>tout le travail</span>{' '}
          pour toi
        </h2>

        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '17px', maxWidth: '550px', margin: '0 auto 56px', lineHeight: 1.6 }}>
          En quelques minutes, l'IA analyse ton expertise et génère un business complet, prêt à vendre.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          textAlign: 'left'
        }}>
          {features.map((f, i) => (
            <div key={i} style={{
              padding: '28px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)',
              transition: 'background 0.3s, border-color 0.3s',
              cursor: 'default'
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                color: 'rgba(255,255,255,0.7)'
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', letterSpacing: '-0.01em', color: '#fff' }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Marquee section */}
      <div style={{ marginTop: '64px' }}>
        <p style={{
          fontSize: 'clamp(20px, 3vw, 28px)',
          fontWeight: 400,
          color: '#fff',
          letterSpacing: '-0.02em',
          marginBottom: '28px',
        }}>
          Tout est <span style={{ fontStyle: 'italic' }}>inclus</span>
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <MarqueeRow items={marqueeItems} direction="left" duration={35} />
          <MarqueeRow items={[...marqueeItems].reverse()} direction="right" duration={40} />
          <MarqueeRow items={marqueeItems.slice(3).concat(marqueeItems.slice(0, 3))} direction="left" duration={32} />
        </div>
      </div>

      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-33.33%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}