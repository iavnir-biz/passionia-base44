import React, { useState } from 'react';
import LandingHero from './LandingHero';
import LandingProblem from './LandingProblem';
import LandingSolution from './LandingSolution';
import LandingHowItWorks from './LandingHowItWorks';
import LandingCalculator from './LandingCalculator';
import LandingPricing from './LandingPricing';
import LandingFAQ from './LandingFAQ';
import LandingTestimonialsScroll from './LandingTestimonialsScroll';
import LandingFooter from './LandingFooter';
import LandingVideo from './LandingVideo';
import CheckoutModal from './CheckoutModal';

export default function LandingNoah2Content() {
  const [showCheckout, setShowCheckout] = useState(false);

  const scrollToCTA = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCTA = () => {
    setShowCheckout(true);
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

      {/* Top announcement bar */}
      <div className="announcement-bar" style={{
        background: '#1a1a1a',
        color: '#fff',
        textAlign: 'center',
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: 500,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <span style={{ opacity: 0.9 }}>🚀</span>
        <span className="announcement-text">Offre de lancement — 29€ paiement unique · Accès immédiat</span>
        <button
          onClick={scrollToCTA}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: '#fff',
            padding: '4px 14px',
            borderRadius: '100px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}
          onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.25)'}
          onMouseOut={e => e.target.style.background = 'rgba(255,255,255,0.15)'}
        >
          Voir l'offre →
        </button>
      </div>

      <LandingHero onCTA={handleCTA} />
      <LandingVideo />
      <LandingProblem />
      <LandingSolution />
      <LandingHowItWorks />
      <LandingCalculator />
      <LandingPricing onCTA={handleCTA} />
      <LandingFAQ />
      <LandingTestimonialsScroll />
      <LandingFooter onCTA={handleCTA} />

      <CheckoutModal isOpen={showCheckout} onClose={() => setShowCheckout(false)} />

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
          .announcement-text {
            font-size: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}