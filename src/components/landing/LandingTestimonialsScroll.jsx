import React from 'react';

const testimonials = [
  // Column 1
  [
    { name: "Sophie M.", role: "Coach bien-être", text: "En 3 jours, Noah m'a créé 4 offres complètes avec les prix, les pages de vente et les emails. J'aurais mis des semaines à faire ça seule." },
    { name: "Julien R.", role: "Formateur fitness", text: "Je ne savais pas comment structurer mes offres. Noah m'a tout généré : du low-ticket au premium. J'ai lancé ma première vente en 5 jours." },
    { name: "Camille D.", role: "Prof de langues", text: "L'analyse de marché m'a donné confiance. Les chiffres étaient là, la demande existait. Il me manquait juste le plan — Noah l'a fait." },
    { name: "Nadia K.", role: "Experte nutrition", text: "Le plan d'action jour par jour m'a débloquée. Plus besoin de réfléchir à quoi faire, tout est là." },
  ],
  // Column 2
  [
    { name: "Thomas L.", role: "Développeur web", text: "Je pensais que vendre des formations c'était compliqué. Noah m'a prouvé le contraire. En 10 minutes j'avais mon offre et mon pricing." },
    { name: "Marie P.", role: "Photographe", text: "Les messages de vente générés sont incroyables. J'ai juste copié-collé sur Instagram et j'ai eu mes premières demandes le jour même." },
    { name: "Lucas B.", role: "Coach sportif", text: "La page de vente était prête en quelques minutes. Professionnelle, convaincante. Mes clients ont adoré." },
    { name: "Émilie V.", role: "Designer graphique", text: "Noah comprend vraiment ton expertise et crée des offres qui correspondent à ta valeur. Pas du générique, du sur-mesure." },
  ],
  // Column 3
  [
    { name: "Antoine F.", role: "Musicien", text: "J'avais peur de fixer mes prix. Noah m'a montré que mon savoir valait bien plus que ce que je pensais. Résultat : 2 400€/mois projetés." },
    { name: "Sarah G.", role: "Prof de yoga", text: "La séquence de 5 emails marketing est brillante. Chaque email donne envie d'acheter sans être pushy. C'est exactement ce qu'il me fallait." },
    { name: "Kevin H.", role: "Expert SEO", text: "Le storytelling de 'Ta vie future' m'a mis les larmes aux yeux. Ça m'a remotivé à fond. Et le plan concret derrière, c'est du béton." },
    { name: "Clara M.", role: "Consultante RH", text: "Tout est personnalisé à ma niche. Les avatars clients, les douleurs identifiées, les solutions proposées. On dirait qu'un expert a passé des heures dessus." },
  ],
];

function ScrollColumn({ items, direction = 'up', speed = 35 }) {
  const doubled = [...items, ...items];
  return (
    <div style={{
      overflow: 'hidden',
      height: '520px',
      position: 'relative',
      flex: 1,
      minWidth: '280px',
    }}>
      {/* Fade top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '60px',
        background: 'linear-gradient(to bottom, #111111, transparent)',
        zIndex: 2, pointerEvents: 'none',
      }} />
      {/* Fade bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px',
        background: 'linear-gradient(to top, #111111, transparent)',
        zIndex: 2, pointerEvents: 'none',
      }} />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        animation: `scroll-${direction} ${speed}s linear infinite`,
      }}>
        {doubled.map((item, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '14px',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
              }}>
                {item.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{item.name}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{item.role}</div>
              </div>
            </div>
            <p style={{
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.65)',
              margin: 0,
            }}>
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingTestimonialsScroll() {
  return (
    <section style={{
      background: '#111111',
      padding: '80px 24px 0',
      overflow: 'hidden',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <p style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.4)',
          marginBottom: '12px',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>
          Témoignages
        </p>
        <h2 style={{
          fontSize: 'clamp(28px, 4.5vw, 48px)',
          fontWeight: 400,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          color: '#fff',
        }}>
          Ils ont lancé grâce à{' '}
          <span style={{
            fontStyle: 'italic',
            fontWeight: 500,
            background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>NOAH™</span>
          {' '}💜
        </h2>
      </div>

      <div style={{
        display: 'flex',
        gap: '16px',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
        <ScrollColumn items={testimonials[0]} direction="up" speed={40} />
        <ScrollColumn items={testimonials[1]} direction="down" speed={45} />
        <ScrollColumn items={testimonials[2]} direction="up" speed={38} />
      </div>

      <style>{`
        @keyframes scroll-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scroll-down {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .testimonials-columns {
            flex-direction: column;
          }
        }
      `}</style>
    </section>
  );
}