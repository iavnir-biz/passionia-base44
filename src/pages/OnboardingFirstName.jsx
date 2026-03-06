import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ArrowRight, Loader2 } from "lucide-react";

export default function OnboardingFirstName() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    checkExisting();
  }, []);

  const checkExisting = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(window.location.href);
        return;
      }
      const user = await base44.auth.me();
      if (user.firstName) setFirstName(user.firstName);
      const stored = localStorage.getItem("onboarding_firstName");
      if (stored && !user.firstName) setFirstName(stored);
    } catch (e) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    } finally {
      setInitialLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!firstName.trim() || loading) return;
    setLoading(true);
    try {
      const cleanName = firstName.trim().slice(0, 50);
      localStorage.setItem("onboarding_firstName", cleanName);
      await base44.auth.updateMe({ firstName: cleanName });
      navigate(createPageUrl("OnboardingDynamic"));
    } catch (e) {
      console.error("Error saving firstName:", e);
      navigate(createPageUrl("OnboardingDynamic"));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleContinue();
    }
  };

  if (initialLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#1a1a1a' }} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#ffffff',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '40px 24px',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ width: '100%', maxWidth: '480px', textAlign: 'center' }}>

        {/* Badge pill — same style as landing */}
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
          <span style={{
            background: '#1a1a1a',
            color: '#fff',
            padding: '2px 8px',
            borderRadius: '100px',
            fontSize: '11px',
            fontWeight: 600
          }}>ÉTAPE 1</span>
          On fait connaissance
        </div>

        {/* Title — same mixed weight style as landing hero */}
        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 44px)',
          fontWeight: 400,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          color: '#1a1a1a',
          marginBottom: '16px',
        }}>
          Comment tu t'<span style={{
            fontStyle: 'italic',
            fontWeight: 500,
            background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            display: 'inline-block',
            paddingRight: '0.3em',
            marginRight: '-0.3em',
            paddingBottom: '0.1em',
            marginBottom: '-0.1em',
          }}>appelles</span> ?
        </h1>

        <p style={{
          fontSize: '16px',
          color: '#888',
          lineHeight: 1.6,
          maxWidth: '400px',
          margin: '0 auto 40px',
        }}>
          NOAH™ personnalise tout ton parcours — tes offres, tes messages, ton plan d'action — avec ton prénom.
        </p>

        {/* Input — clean minimal style */}
        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ton prénom..."
            autoFocus
            maxLength={50}
            style={{
              width: '100%',
              padding: '16px 20px',
              fontSize: '18px',
              fontWeight: 500,
              fontFamily: "'Inter', sans-serif",
              color: '#1a1a1a',
              background: '#f8f8f8',
              border: '1px solid #e5e5e5',
              borderRadius: '100px',
              textAlign: 'center',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#1a1a1a';
              e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.08)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e5e5';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* CTA — same style as landing hero button */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: '#f8f8f8',
          borderRadius: '100px',
          padding: '6px',
          border: '1px solid #e5e5e5',
          width: '100%',
          maxWidth: '360px',
        }}>
          <button
            onClick={handleContinue}
            disabled={!firstName.trim() || loading}
            style={{
              background: !firstName.trim() ? '#ccc' : '#1a1a1a',
              color: '#fff',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '100px',
              fontSize: '15px',
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              cursor: !firstName.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'opacity 0.2s, background 0.2s',
              width: '100%',
            }}
            onMouseOver={e => { if (firstName.trim()) e.currentTarget.style.opacity = '0.85'; }}
            onMouseOut={e => e.currentTarget.style.opacity = '1'}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                C'est parti <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

        {/* Subtle note */}
        <p style={{
          fontSize: '13px',
          color: '#bbb',
          marginTop: '24px',
        }}>
          Gratuit · 5 minutes · 100% personnalisé par l'IA
        </p>
      </div>
    </div>
  );
}