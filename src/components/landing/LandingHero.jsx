import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { AnimatedTooltip } from '@/components/ui/animated-tooltip';

export default function LandingHero({ onCTA }) {
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) e.target.classList.add('visible'); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="landing-fade" style={{
      textAlign: 'center',
      padding: '80px 24px 60px',
      maxWidth: '820px',
      margin: '0 auto'
    }}>
      {/* Badge pill */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: '#f5f5f5',
        border: '1px solid #e8e8e8',
        borderRadius: '100px',
        padding: '6px 16px',
        fontSize: '13px',
        color: '#666',
        marginBottom: '32px'
      }}>
        <span style={{ background: '#1a1a1a', color: '#fff', padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 600 }}>NEW</span>
        Transforme ton savoir-faire en revenus avec l'IA →
      </div>

      {/* Title — mixed weight like Amplemarket */}
      <h1 style={{
        fontSize: 'clamp(36px, 5.5vw, 60px)',
        fontWeight: 400,
        lineHeight: 1.15,
        letterSpacing: '-0.03em',
        color: '#1a1a1a',
        marginBottom: '24px'
      }}>
        Génère tes <span style={{
          fontStyle: 'italic',
          fontWeight: 500,
          background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>4 offres</span> et fais ta première vente en <strong>24h</strong>
      </h1>

      <p style={{
        fontSize: '18px',
        color: '#888',
        lineHeight: 1.6,
        maxWidth: '600px',
        margin: '0 auto 40px'
      }}>
        NOAH™ analyse ton expertise, structure tes offres, rédige tes contenus de vente et te guide pas à pas — pour viser +4 000€/mois.
      </p>

      {/* CTA bar — responsive */}
      <div className="hero-cta-bar" style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: '#f8f8f8',
        borderRadius: '100px',
        padding: '6px',
        border: '1px solid #e5e5e5',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <span className="hero-cta-price" style={{ padding: '0 20px', color: '#999', fontSize: '15px' }}>
          29€ · sans engagement · paiement unique
        </span>
        <button
          onClick={onCTA}
          style={{
            background: '#1a1a1a',
            color: '#fff',
            border: 'none',
            padding: '14px 28px',
            borderRadius: '100px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'opacity 0.2s',
            whiteSpace: 'nowrap',
          }}
          onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
          onMouseOut={e => e.currentTarget.style.opacity = '1'}
        >
          Accéder à NOAH™ <ArrowRight size={16} />
        </button>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .hero-cta-bar {
            flex-direction: column !important;
            border-radius: 20px !important;
            gap: 4px;
            width: 100%;
            max-width: 320px;
          }
          .hero-cta-price {
            padding: 10px 16px !important;
            font-size: 13px !important;
            text-align: center;
          }
          .hero-cta-bar button {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>

      {/* Social proof with animated avatars */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
        marginTop: '24px',
        flexWrap: 'wrap'
      }}>
        <AnimatedTooltip items={[
          { id: 1, name: "Sophie M.", designation: "Coach bien-être", image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930250f9337193d59c1dcf5/ec762acef_WhatsAppImage2026-03-05at190938.jpg" },
          { id: 2, name: "Thomas L.", designation: "Formateur fitness", image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930250f9337193d59c1dcf5/1edef10d3_WhatsAppImage2026-03-05at1909383.jpg" },
          { id: 3, name: "Marie P.", designation: "Photographe", image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930250f9337193d59c1dcf5/c5613076a_WhatsAppImage2026-03-05at1909381.jpg" },
          { id: 4, name: "Lucas B.", designation: "Coach sportif", image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930250f9337193d59c1dcf5/4ccf19cfc_WhatsAppImage2026-03-05at1909384.jpg" },
          { id: 5, name: "Émilie V.", designation: "Designer", image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930250f9337193d59c1dcf5/5f1c7bd56_Screenshotfrom20250415193811png_67fe9999ae1b7.png" },
        ]} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px' }}>
          <div style={{ display: 'flex', gap: '2px' }}>
            {[1,2,3,4,5].map(i => (
              <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#1a1a1a" stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>
          <span style={{ fontSize: '13px', color: '#999' }}>+500 créateurs ont lancé leur business</span>
        </div>
      </div>
    </section>
  );
}