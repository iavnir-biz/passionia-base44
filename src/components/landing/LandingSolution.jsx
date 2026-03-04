import React, { useEffect, useRef } from 'react';
import { Zap, FileText, Mail, MessageSquare, Users, Clock } from 'lucide-react';

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
      padding: '80px 24px',
      maxWidth: '1000px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <p style={{
        fontSize: '13px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        color: '#999',
        marginBottom: '16px'
      }}>La solution</p>

      <h2 style={{
        fontSize: 'clamp(28px, 4vw, 44px)',
        fontWeight: 400,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
        marginBottom: '16px'
      }}>
        NOAH™ fait <span style={{ fontStyle: 'italic' }}>tout le travail</span> pour toi
      </h2>

      <p style={{ color: '#888', fontSize: '17px', maxWidth: '550px', margin: '0 auto 56px' }}>
        En quelques minutes, l'IA analyse ton expertise et génère un business complet, prêt à vendre.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        textAlign: 'left'
      }}>
        {features.map((f, i) => (
          <div key={i} style={{
            padding: '28px',
            borderRadius: '20px',
            border: '1px solid #eee',
            background: '#fff',
            transition: 'box-shadow 0.3s, border-color 0.3s',
            cursor: 'default'
          }}
          onMouseOver={e => { e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#ddd'; }}
          onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#eee'; }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              color: '#1a1a1a'
            }}>
              {f.icon}
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', letterSpacing: '-0.01em' }}>{f.title}</h3>
            <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.5 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}