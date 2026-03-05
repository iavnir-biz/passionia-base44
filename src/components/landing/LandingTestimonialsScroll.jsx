import React from 'react';

const IMG1 = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930250f9337193d59c1dcf5/1edef10d3_WhatsAppImage2026-03-05at1909383.jpg";
const IMG2 = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930250f9337193d59c1dcf5/4ccf19cfc_WhatsAppImage2026-03-05at1909384.jpg";
const IMG3 = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930250f9337193d59c1dcf5/ec762acef_WhatsAppImage2026-03-05at190938.jpg";
const IMG4 = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930250f9337193d59c1dcf5/5f1c7bd56_Screenshotfrom20250415193811png_67fe9999ae1b7.png";
const IMG5 = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930250f9337193d59c1dcf5/c5613076a_WhatsAppImage2026-03-05at1909381.jpg";

const testimonials = [
  // Column 1
  [
    { name: "Sophie M.", role: "Coach bien-être", image: IMG3, text: "En 3 jours, Noah m'a créé 4 offres complètes avec les prix, les pages de vente et les emails. J'aurais mis des semaines à faire ça seule." },
    { name: "Julien R.", role: "Formateur fitness", image: IMG1, text: "Je ne savais pas comment structurer mes offres. Noah m'a tout généré : du low-ticket au premium. J'ai lancé ma première vente en 5 jours." },
    { name: "Camille D.", role: "Prof de langues", image: IMG5, text: "L'analyse de marché m'a donné confiance. Les chiffres étaient là, la demande existait. Il me manquait juste le plan — Noah l'a fait." },
    { name: "Nadia K.", role: "Experte nutrition", image: IMG4, text: "Le plan d'action jour par jour m'a débloquée. Plus besoin de réfléchir à quoi faire, tout est là." },
  ],
  // Column 2
  [
    { name: "Thomas L.", role: "Développeur web", image: IMG2, text: "Je pensais que vendre des formations c'était compliqué. Noah m'a prouvé le contraire. En 10 minutes j'avais mon offre et mon pricing." },
    { name: "Marie P.", role: "Photographe", image: IMG5, text: "Les messages de vente générés sont incroyables. J'ai juste copié-collé sur Instagram et j'ai eu mes premières demandes le jour même." },
    { name: "Lucas B.", role: "Coach sportif", image: IMG1, text: "La page de vente était prête en quelques minutes. Professionnelle, convaincante. Mes clients ont adoré." },
    { name: "Émilie V.", role: "Designer graphique", image: IMG4, text: "Noah comprend vraiment ton expertise et crée des offres qui correspondent à ta valeur. Pas du générique, du sur-mesure." },
  ],
  // Column 3
  [
    { name: "Antoine F.", role: "Musicien", image: IMG2, text: "J'avais peur de fixer mes prix. Noah m'a montré que mon savoir valait bien plus que ce que je pensais. Résultat : 2 400€/mois projetés." },
    { name: "Sarah G.", role: "Prof de yoga", image: IMG3, text: "La séquence de 5 emails marketing est brillante. Chaque email donne envie d'acheter sans être pushy. C'est exactement ce qu'il me fallait." },
    { name: "Kevin H.", role: "Expert SEO", image: IMG1, text: "Le storytelling de 'Ta vie future' m'a mis les larmes aux yeux. Ça m'a remotivé à fond. Et le plan concret derrière, c'est du béton." },
    { name: "Clara M.", role: "Consultante RH", image: IMG5, text: "Tout est personnalisé à ma niche. Les avatars clients, les douleurs identifiées, les solutions proposées. On dirait qu'un expert a passé des heures dessus." },
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
              {item.image ? (
                <img src={item.image} alt={item.name} style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1px solid rgba(255,255,255,0.15)',
                  flexShrink: 0,
                }} />
              ) : (
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
              )}
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
        <h2 style={{
          fontSize: 'clamp(28px, 4.5vw, 48px)',
          fontWeight: 400,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          color: '#fff',
        }}>
          ils ont lancé grâce à{' '}
          <span style={{
            fontStyle: 'italic',
            fontWeight: 500,
            color: '#fff',
          }}>noah™</span>
        </h2>
      </div>

      <div className="testimonials-columns" style={{
        display: 'flex',
        gap: '16px',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
        <ScrollColumn items={testimonials[0]} direction="up" speed={40} />
        <div className="testimonials-col-2">
          <ScrollColumn items={testimonials[1]} direction="down" speed={45} />
        </div>
        <div className="testimonials-col-3">
          <ScrollColumn items={testimonials[2]} direction="up" speed={38} />
        </div>
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
          .testimonials-col-3 {
            display: none;
          }
        }
        @media (max-width: 520px) {
          .testimonials-col-2 {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}