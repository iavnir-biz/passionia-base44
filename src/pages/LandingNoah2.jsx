import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import LandingHero from '../components/landing/LandingHero';
import LandingProblem from '../components/landing/LandingProblem';
import LandingSolution from '../components/landing/LandingSolution';
import LandingHowItWorks from '../components/landing/LandingHowItWorks';
import LandingIncludes from '../components/landing/LandingIncludes';
import LandingTestimonials from '../components/landing/LandingTestimonials';
import LandingPricing from '../components/landing/LandingPricing';
import LandingFAQ from '../components/landing/LandingFAQ';
import LandingMarquee from '../components/landing/LandingMarquee';
import LandingFooter from '../components/landing/LandingFooter';
import LandingVideo from '../components/landing/LandingVideo';

export default function LandingNoah2() {
  const scrollToCTA = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCTA = () => {
    base44.auth.redirectToLogin(window.location.origin + '/OnboardingFirstName');
  };

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", color: '#1a1a1a', background: '#ffffff' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Top announcement bar */}
      <div style={{
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
        <span>Offre de lancement — 29€ paiement unique · Accès immédiat</span>
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

      {/* Navbar */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <span style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.5px' }}>
          NOAH<span style={{ fontSize: '14px', verticalAlign: 'super' }}>™</span>
        </span>
        <button
          onClick={handleCTA}
          style={{
            background: '#1a1a1a',
            color: '#fff',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '100px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={e => e.target.style.opacity = '0.85'}
          onMouseOut={e => e.target.style.opacity = '1'}
        >
          Accéder à NOAH™ — 29€
        </button>
      </nav>

      <LandingHero onCTA={handleCTA} />
      <LandingVideo />
      <LandingProblem />
      <LandingSolution />
      <LandingHowItWorks />
      <LandingIncludes />
      <LandingTestimonials />
      <LandingPricing onCTA={handleCTA} />
      <LandingFAQ />
      <LandingMarquee />
      <LandingFooter onCTA={handleCTA} />

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
      `}</style>
    </div>
  );
}