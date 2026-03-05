import React, { useEffect, useRef } from 'react';

export default function LandingTestimonials() {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) e.target.classList.add('visible'); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const testimonials = [
    { name: "Marie L.", role: "Coach bien-être", image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930250f9337193d59c1dcf5/ec762acef_WhatsAppImage2026-03-05at190938.jpg", text: "En 2 semaines, j'ai fait ma première vente à 297€. NOAH™ m'a donné la clarté qui me manquait depuis des mois." },
    { name: "Thomas B.", role: "Expert Excel", image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930250f9337193d59c1dcf5/4ccf19cfc_WhatsAppImage2026-03-05at1909384.jpg", text: "Je pensais que mon savoir était trop « basique » pour être vendu. NOAH™ m'a prouvé le contraire — 1 200€ le premier mois." },
    { name: "Sophie M.", role: "Formatrice langue des signes", image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930250f9337193d59c1dcf5/5f1c7bd56_Screenshotfrom20250415193811png_67fe9999ae1b7.png", text: "Le plan d'action est incroyable. Chaque jour, je savais exactement quoi faire. Plus d'excuse pour procrastiner." }
  ];

  return (
    <section ref={ref} className="landing-fade" style={{
      padding: '80px 24px',
      background: '#fafafa'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{
          fontSize: '13px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: '#999',
          marginBottom: '16px'
        }}>Témoignages</p>

        <h2 style={{
          fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: 400,
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
          marginBottom: '48px'
        }}>
          Ils ont transformé leur <span style={{ fontStyle: 'italic' }}>expertise</span>
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{
              padding: '32px',
              background: '#fff',
              borderRadius: '20px',
              border: '1px solid #eee',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', gap: '2px', marginBottom: '20px' }}>
                {[1,2,3,4,5].map(j => (
                  <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="#1a1a1a" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p style={{ fontSize: '15px', lineHeight: 1.6, color: '#555', marginBottom: '24px' }}>
                "{t.text}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={t.image} alt={t.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e5e5' }} />
                <div>
                  <p style={{ fontWeight: 600, fontSize: '14px', color: '#1a1a1a' }}>{t.name}</p>
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