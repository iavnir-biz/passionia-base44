import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AnimatedTooltip } from '@/components/ui/animated-tooltip';
import { createPageUrl } from '@/utils';

// V2 versions of modified components
import LandingHeroV2 from './LandingHeroV2';
import LandingVideoV2 from './LandingVideoV2';
import LandingProblemV2 from './LandingProblemV2';
import LandingBeforeAfter from './LandingBeforeAfter';
import LandingSolutionV2 from './LandingSolutionV2';
import LandingWhyDifferent from './LandingWhyDifferent';
import LandingFounders from './LandingFounders';
import LandingPricingV2 from './LandingPricingV2';
import LandingGuarantee from './LandingGuarantee';
import LandingTestimonialsScrollV2 from './LandingTestimonialsScrollV2';
import LandingFooterV2 from './LandingFooterV2';

// Unchanged components
import LandingAnnouncementBar from './LandingAnnouncementBar';
import LandingStripePanel from './LandingStripePanel';
import LandingHowItWorks from './LandingHowItWorks';
import LandingFAQ from './LandingFAQ';

export default function LandingNoah2ContentV2() {
  const navigate = useNavigate();

  const scrollToCTA = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCTA = () => {
    navigate(createPageUrl('Panier'));
  };

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", color: '#1a1a1a', background: '#ffffff' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      {/* Meta Pixel */}
      <script dangerouslySetInnerHTML={{ __html: `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '1958750871541779');
        fbq('track', 'PageView');
      `}} />
      <noscript>
        <img height="1" width="1" style={{ display: 'none' }}
          src="https://www.facebook.com/tr?id=1958750871541779&ev=PageView&noscript=1"
        />
      </noscript>

      {/* SECTION 1 — Barre promo top */}
      <LandingAnnouncementBar onScrollToCTA={scrollToCTA} />

      {/* SECTION 2 — Hero (optimisé) */}
      <LandingHeroV2 />

      {/* SECTION 2b — Vidéo démo */}
      <LandingVideoV2 />

      {/* SECTION 3 — CTA bar + Social proof */}
      <div style={{ textAlign: 'center', padding: '0 24px 40px', maxWidth: '820px', margin: '0 auto' }}>
        <div className="hero-cta-bar" style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: '#f8f8f8',
          borderRadius: '100px',
          padding: '6px',
          border: '1px solid #e5e5e5',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '24px',
        }}>
          <span className="hero-cta-price" style={{ padding: '0 20px', color: '#999', fontSize: '15px' }}>
            29€ · sans engagement · paiement unique
          </span>
          <button
            onClick={handleCTA}
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
            Créer mes offres maintenant <ArrowRight size={16} />
          </button>
        </div>

        {/* Social proof */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          flexWrap: 'wrap',
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
      </div>

      {/* SECTION 4 — Le Problème (enrichi) */}
      <LandingProblemV2 />

      {/* SECTION 5 — Avant/Après (NOUVEAU) */}
      <LandingBeforeAfter />

      {/* SECTION 6 — La Solution (optimisée) */}
      <LandingSolutionV2 />

      {/* SECTION 7 — Pourquoi c'est différent (NOUVEAU) */}
      <LandingWhyDifferent />

      {/* SECTION 8 — Comment ça marche (inchangé) */}
      <LandingHowItWorks />

      {/* SECTION 9 — Qui sommes-nous (NOUVEAU) */}
      <LandingFounders />

      {/* SECTION 10 — Pricing (optimisé) */}
      <LandingPricingV2 onCTA={handleCTA} />

      {/* SECTION 11 — Bloc Stripe (déplacé ici après pricing) */}
      <LandingStripePanel />

      {/* SECTION 12 — Garantie (NOUVEAU) */}
      <LandingGuarantee />

      {/* SECTION 13 — Wall témoignages (enrichi) */}
      <LandingTestimonialsScrollV2 />

      {/* SECTION 14 — FAQ (inchangé) */}
      <LandingFAQ />

      {/* SECTION 15 — CTA final + Footer (optimisé) */}
      <LandingFooterV2 onCTA={handleCTA} />

      <style>{`
        .landing-fade {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .landing-fade.visible {
          opacity: 1;
          transform: translateY(0);
        }
        @media (max-width: 480px) {
          .announce-text {
            font-size: 11px !important;
          }
          .landing-hero-section {
            padding-top: 32px !important;
            padding-bottom: 24px !important;
          }
          .landing-hero-section h1 {
            font-size: clamp(22px, 7vw, 36px) !important;
            margin-bottom: 16px !important;
          }
          .landing-hero-section p {
            font-size: 15px !important;
          }
        }
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
    </div>
  );
}
