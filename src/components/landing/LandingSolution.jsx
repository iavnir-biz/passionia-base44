import React from 'react';
import { Zap, FileText, Mail, MessageSquare, Users, Calendar } from 'lucide-react';
import useFadeIn from './useFadeIn';

const features = [
  { icon: Zap, title: "4 offres structurées", desc: "Low-ticket, order bump, upsell, premium — prix et positionnement inclus." },
  { icon: FileText, title: "Pages de vente", desc: "Textes persuasifs générés et prêts à copier-coller." },
  { icon: Mail, title: "Séquence emails", desc: "5 emails de vente rédigés pour convertir tes prospects." },
  { icon: MessageSquare, title: "Messages de vente", desc: "Scripts pour réseaux sociaux et conversations directes." },
  { icon: Users, title: "Avatars clients", desc: "Profils détaillés de tes clients idéaux." },
  { icon: Calendar, title: "Plan d'action 7 jours", desc: "Une action par jour. Tu sais exactement quoi faire." }
];

export default function LandingSolution() {
  const ref = useFadeIn();

  return (
    <section style={{ padding: '100px 24px' }}>
      <div ref={ref} className="landing-fade" style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#aaa', marginBottom: '16px' }}>
          La solution
        </p>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 600, letterSpacing: '-1px', lineHeight: 1.15, marginBottom: '20px' }}>
          NOAH™ fait{' '}
          <span style={{ fontStyle: 'italic', fontWeight: 400 }}>tout le travail</span>{' '}
          pour toi
        </h2>
        <p style={{ fontSize: '17px', color: '#888', maxWidth: '550px', margin: '0 auto 64px', lineHeight: 1.6 }}>
          En quelques minutes, l'IA analyse ton expertise et génère un business complet, prêt à vendre.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '20px',
          textAlign: 'left'
        }}>
          {features.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} style={{
                padding: '28px',
                borderRadius: '16px',
                border: '1px solid #eee',
                transition: 'all 0.25s ease',
                cursor: 'default'
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#ccc'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.06)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = '#eee'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <Icon size={20} color="#1a1a1a" />
                </div>
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