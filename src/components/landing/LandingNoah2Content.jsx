import React, { useState } from 'react';
import LandingHero from './LandingHero';
import LandingProblem from './LandingProblem';
import LandingSolution from './LandingSolution';
import LandingHowItWorks from './LandingHowItWorks';
import LandingScaleSection from './LandingScaleSection';
import LandingPricing from './LandingPricing';
import LandingFAQ from './LandingFAQ';
import LandingTestimonialsScroll from './LandingTestimonialsScroll';
import LandingFooter from './LandingFooter';
import LandingVideo from './LandingVideo';
import CheckoutModal from './CheckoutModal';
import LandingAnnouncementBar from './LandingAnnouncementBar';

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
      <LandingAnnouncementBar onScrollToCTA={scrollToCTA} />

      <LandingHero onCTA={handleCTA} />
      <LandingVideo />
      <LandingProblem />
      <LandingSolution />
      <LandingHowItWorks />
      <LandingScaleSection />
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
          .announce-text {
            font-size: 11px !important;
          }
        }
      `}</style>
    </div>
  );
}