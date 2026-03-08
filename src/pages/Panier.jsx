import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { Check, Shield, ArrowLeft } from 'lucide-react';
import { createPageUrl } from '@/utils';

const stripePromise = loadStripe('pk_live_51QfPN7P7FZHXEZ2M2JkBxFZlslfFqOF4ePCzfaMwthUBTxLV9Ow1OqEYJffAeTXw2bwhiOnaqz6C67e8i66N3iFz00uFjFrfXu');

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930250f9337193d59c1dcf5/9089019f0_Sanstitre500x500px1.png";

const COUNTDOWN_SECONDS = 15 * 60; // 15 minutes

// Helper: fire Meta Pixel event safely
const fbTrack = (event, params) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', event, params);
  }
};

export default function Panier() {
  const navigate = useNavigate();
  const [withBump, setWithBump] = useState(false);
  const [withBump2, setWithBump2] = useState(false);
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_SECONDS);

  // Fire InitiateCheckout on page load
  useEffect(() => {
    fbTrack('InitiateCheckout', { value: 29, currency: 'EUR', num_items: 1 });
  }, []);

  // Countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const totalPrice = 29 + (withBump ? 17 : 0) + (withBump2 ? 37 : 0);

  const handleBump1 = () => {
    const newValue = !withBump;
    setWithBump(newValue);
    if (newValue) {
      fbTrack('AddToCart', { value: 17, currency: 'EUR', content_name: 'Plan action 7 jours' });
    }
  };

  const handleBump2 = () => {
    const newValue = !withBump2;
    setWithBump2(newValue);
    if (newValue) {
      fbTrack('AddToCart', { value: 37, currency: 'EUR', content_name: 'Page de vente + 5 emails' });
    }
  };

  const fetchClientSecret = useCallback(async () => {
    const response = await base44.functions.invoke('createEmbeddedCheckout', { withBump, withBump2 });
    return response.data.clientSecret;
  }, [withBump, withBump2]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '24px 16px 48px',
    }}>
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

      {/* Back button */}
      <div style={{ maxWidth: '500px', margin: '0 auto 16px' }}>
        <button
          onClick={() => navigate(createPageUrl('Welcome'))}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#888', fontSize: '14px', padding: '4px 0',
          }}
        >
          <ArrowLeft size={16} />
          Retour
        </button>
      </div>

      {/* Card */}
      <div style={{
        background: '#fff',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '500px',
        margin: '0 auto',
        boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Gradient top */}
        <div style={{
          height: '4px',
          background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
        }} />

        <div style={{ padding: '32px 28px 28px' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <img src={LOGO_URL} alt="iavnirLab" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          </div>

          {/* Badge */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#1a1a1a', color: '#fff',
              borderRadius: '100px', padding: '6px 16px',
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px',
            }}>
              OFFRE EXCLUSIVE
              <span style={{
                background: '#f97316', color: '#fff',
                borderRadius: '100px', padding: '2px 8px',
                fontSize: '11px', fontWeight: 800, letterSpacing: '0.3px',
                fontVariantNumeric: 'tabular-nums',
              }}>{formatTime(timeLeft)}</span>
            </span>
          </div>

          {/* Price */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div>
              <span style={{ fontSize: '52px', fontWeight: 800, letterSpacing: '-0.03em', color: '#1a1a1a' }}>
                {totalPrice}€
              </span>
              <span style={{ fontSize: '14px', color: '#888', marginLeft: '8px' }}>paiement unique</span>
            </div>
            <p style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>Sans engagement · Accès immédiat</p>
          </div>

          {/* Order bump 1 */}
          <button
            onClick={handleBump1}
            style={{
              width: '100%', border: `2px solid ${withBump ? '#f97316' : '#e5e5e5'}`,
              borderRadius: '14px', padding: '16px',
              background: withBump ? '#fff7ed' : '#fff',
              cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.2s', marginBottom: '10px',
              display: 'flex', alignItems: 'flex-start', gap: '12px',
            }}
          >
            <div style={{
              width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0, marginTop: '2px',
              background: withBump ? '#f97316' : '#fff',
              border: `2px solid ${withBump ? '#f97316' : '#ccc'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}>
              {withBump && <Check size={12} color="#fff" strokeWidth={3} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a' }}>
                  ⚡ Ajouter : Plan d'action 7 jours détaillé
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a', marginLeft: '12px', flexShrink: 0 }}>+17€</span>
              </div>
              <p style={{ fontSize: '12px', color: '#777', lineHeight: 1.5, margin: 0 }}>
                Checklist jour par jour avec les actions concrètes pour réaliser ta première vente en 7 jours.
              </p>
            </div>
          </button>

          {/* Order bump 2 */}
          <button
            onClick={handleBump2}
            style={{
              width: '100%', border: `2px solid ${withBump2 ? '#a78bfa' : '#e5e5e5'}`,
              borderRadius: '14px', padding: '16px',
              background: withBump2 ? '#f5f3ff' : '#fff',
              cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.2s', marginBottom: '24px',
              display: 'flex', alignItems: 'flex-start', gap: '12px',
              position: 'relative',
            }}
          >
            {/* Badge LE PLUS CHOISI */}
            <div style={{
              position: 'absolute', top: '-10px', left: '16px',
              background: 'linear-gradient(135deg, #a78bfa, #ec4899)',
              color: '#fff', fontSize: '9px', fontWeight: 800,
              letterSpacing: '0.8px', padding: '3px 10px', borderRadius: '100px',
            }}>
              LE PLUS CHOISI
            </div>
            <div style={{
              width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0, marginTop: '2px',
              background: withBump2 ? '#a78bfa' : '#fff',
              border: `2px solid ${withBump2 ? '#a78bfa' : '#ccc'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}>
              {withBump2 && <Check size={12} color="#fff" strokeWidth={3} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a' }}>
                  💎 Ajouter : Page de vente personnalisée + 5 emails marketing
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: '12px', flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', color: '#bbb', textDecoration: 'line-through', lineHeight: 1 }}>57€</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#a78bfa', lineHeight: 1.2 }}>+37€</span>
                  <span style={{ fontSize: '9px', fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #a78bfa, #ec4899)', borderRadius: '100px', padding: '1px 6px', marginTop: '2px', letterSpacing: '0.3px' }}>-20€</span>
                </div>
              </div>
              <p style={{ fontSize: '12px', color: '#777', lineHeight: 1.5, margin: 0 }}>
                1 page de vente pour ton produit principal + 5 emails marketing rédigés et 100% personnalisés. Prêts à copier-coller.
              </p>
            </div>
          </button>

          {/* Stripe checkout */}
          <EmbeddedCheckoutProvider key={`${withBump}-${withBump2}`} stripe={stripePromise} options={{ fetchClientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>

          {/* Trust */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '16px' }}>
            <Shield size={13} color="#bbb" />
            <span style={{ fontSize: '12px', color: '#bbb' }}>Paiement sécurisé Stripe · Garantie 30 jours</span>
          </div>
        </div>
      </div>
    </div>
  );
}
