import React from 'react';

const rows = [
  [
    { text: "4 offres complètes générées", color: "#a78bfa" },
    { text: "Page de vente personnalisée", color: "#f97316" },
    { text: "Validation marché par IA", color: "#22c55e" },
    { text: "Séquence 5 emails marketing", color: "#ec4899" },
    { text: "Avatars clients détaillés", color: "#3b82f6" },
    { text: "Plan d'action 7 jours", color: "#f59e0b" },
  ],
  [
    { text: "Scripts de vente réseaux sociaux", color: "#ef4444" },
    { text: "Estimation revenus mensuels", color: "#14b8a6" },
    { text: "Storytelling ta vie future", color: "#8b5cf6" },
    { text: "Analyse SWOT complète", color: "#f97316" },
    { text: "Coaching IA personnalisé", color: "#06b6d4" },
    { text: "Accès à vie + mises à jour", color: "#22c55e" },
  ],
  [
    { text: "Funnel 4 niveaux d'offres", color: "#ec4899" },
    { text: "Pricing optimisé par IA", color: "#eab308" },
    { text: "Messages de vente prêts", color: "#3b82f6" },
    { text: "Contenu réseaux sociaux", color: "#a78bfa" },
    { text: "Guide lancement pas à pas", color: "#10b981" },
    { text: "Projection financière", color: "#f97316" },
  ],
];

function MarqueeRow({ items, direction = 'left', speed = 40 }) {
  const doubled = [...items, ...items];
  return (
    <div style={{ overflow: 'hidden', width: '100%', position: 'relative' }}>
      <div style={{
        display: 'flex',
        gap: '12px',
        width: 'max-content',
        animation: `marquee-${direction} ${speed}s linear infinite`,
      }}>
        {doubled.map((item, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '100px',
            padding: '10px 20px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '3px',
              background: item.color,
              flexShrink: 0,
            }} />
            <span style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 500,
            }}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingMarquee() {
  return (
    <section style={{
      background: '#111',
      padding: '60px 0',
      overflow: 'hidden',
    }}>
      <p style={{
        textAlign: 'center',
        fontSize: '15px',
        color: 'rgba(255,255,255,0.5)',
        marginBottom: '32px',
        fontWeight: 500,
      }}>
        Ne rate aucune opportunité
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <MarqueeRow items={rows[0]} direction="left" speed={45} />
        <MarqueeRow items={rows[1]} direction="right" speed={50} />
        <MarqueeRow items={rows[2]} direction="left" speed={42} />
      </div>

      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}