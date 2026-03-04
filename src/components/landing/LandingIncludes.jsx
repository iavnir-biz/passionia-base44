import React from 'react';
import { Package, FileText, Mail, MessageSquare, BarChart3, CalendarDays } from 'lucide-react';
import useFadeIn from './useFadeIn';

const items = [
  { icon: Package, title: "4 offres complètes", desc: "Structurées, tarifées, positionnées — prêtes à vendre." },
  { icon: FileText, title: "Page de vente", desc: "Texte de vente généré pour convertir tes visiteurs." },
  { icon: Mail, title: "5 emails marketing", desc: "Prêts à envoyer pour ta séquence de lancement." },
  { icon: MessageSquare, title: "Messages de vente", desc: "Scripts pour réseaux sociaux et conversations." },
  { icon: BarChart3, title: "Analyse de marché", desc: "Validation de ton idée avec données concrètes." },
  { icon: CalendarDays, title: "Plan d'action 7 jours", desc: "Étape par étape, une action par jour." }
];

export default function LandingIncludes() {
  const ref = useFadeIn();

  return (
    <section style={{ padding: '100px 24px' }}>
      <div ref={ref} className="landing-fade" style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#aaa', marginBottom: '16px' }}>
          Ce que tu obtiens
        </p>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 600, letterSpacing: '-1px', lineHeight: 1.15, marginBottom: '64px' }}>
          Tout ce dont tu as besoin{' '}
          <span style={{ fontStyle: 'italic', fontWeight: 400 }}>pour lancer</span>
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '20px',
          textAlign: 'left'
        }}>
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} style={{
                background: '#fafafa',
                borderRadius: '16px',
                padding: '28px',
                transition: 'all 0.25s'
              }}
              onMouseOver={e => { e.currentTarget.style.background = '#f0f0f0'; }}
              onMouseOut={e => { e.currentTarget.style.background = '#fafafa'; }}
              >
                <Icon size={24} color="#1a1a1a" style={{ marginBottom: '14px' }} />
                <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '8px', letterSpacing: '-0.3px' }}>{item.title}</h3>
                <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}