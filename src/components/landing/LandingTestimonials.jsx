import React from 'react';
import { Star } from 'lucide-react';
import useFadeIn from './useFadeIn';

const testimonials = [
  {
    quote: "En 2 semaines, j'ai fait ma première vente à 297€. NOAH™ m'a donné la clarté qui me manquait depuis des mois.",
    name: "Marie L.",
    role: "Coach en nutrition",
    avatar: "M"
  },
  {
    quote: "Je pensais que mon savoir était trop « basique ». NOAH™ m'a prouvé le contraire — 1 200€ le premier mois.",
    name: "Thomas B.",
    role: "Expert Excel",
    avatar: "T"
  },
  {
    quote: "Le plan d'action est incroyable. Chaque jour, je savais exactement quoi faire. Plus d'excuse pour procrastiner.",
    name: "Sophie M.",
    role: "Formatrice en langues",
    avatar: "S"
  }
];

export default function LandingTestimonials() {
  const ref = useFadeIn();

  return (
    <section style={{ padding: '100px 24px', background: '#fafafa' }}>
      <div ref={ref} className="landing-fade" style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#aaa', marginBottom: '16px' }}>
          Ils l'ont fait
        </p>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 600, letterSpacing: '-1px', lineHeight: 1.15, marginBottom: '64px' }}>
          Ce qu'ils disent de{' '}
          <span style={{ fontStyle: 'italic', fontWeight: 400 }}>NOAH™</span>
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          textAlign: 'left'
        }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid #eee',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '16px' }}>
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} fill="#facc15" color="#facc15" />
                  ))}
                </div>
                <p style={{ fontSize: '15px', lineHeight: 1.65, color: '#555', marginBottom: '24px' }}>
                  "{t.quote}"
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#1a1a1a',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 600
                }}>
                  {t.avatar}
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600 }}>{t.name}</p>
                  <p style={{ fontSize: '13px', color: '#999' }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}