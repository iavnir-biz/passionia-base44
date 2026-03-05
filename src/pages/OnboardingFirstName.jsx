import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ArrowRight } from "lucide-react";

export default function OnboardingFirstName() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      setPaymentSuccess(true);
    }
  }, []);

  const handleContinue = async () => {
    if (!firstName.trim() || loading) return;
    setLoading(true);

    const user = await base44.auth.me();

    const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
    if (profiles.length > 0) {
      await base44.entities.UserProfile.update(profiles[0].id, { first_name: firstName.trim() });
    } else {
      await base44.entities.UserProfile.create({ first_name: firstName.trim() });
    }

    navigate(createPageUrl("OnboardingDynamic"));
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#ffffff",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: "480px", width: "100%", textAlign: "center" }}>

        {/* Badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "#f5f5f5",
          border: "1px solid #e8e8e8",
          borderRadius: "100px",
          padding: "6px 16px",
          fontSize: "13px",
          color: "#666",
          marginBottom: "32px",
        }}>
          <span style={{
            background: "#1a1a1a",
            color: "#fff",
            padding: "2px 8px",
            borderRadius: "100px",
            fontSize: "11px",
            fontWeight: 600,
          }}>NOAH™</span>
          {paymentSuccess ? "Paiement confirmé ✓" : "Ton associé IA"}
        </div>

        {/* Success message */}
        {paymentSuccess && (
          <div style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "16px",
            padding: "16px 20px",
            marginBottom: "28px",
            fontSize: "14px",
            color: "#166534",
            lineHeight: 1.6,
          }}>
            🎉 Merci pour ton achat ! Commençons par faire connaissance.
          </div>
        )}

        {/* Title */}
        <h1 style={{
          fontSize: "clamp(28px, 5vw, 42px)",
          fontWeight: 400,
          lineHeight: 1.15,
          letterSpacing: "-0.03em",
          color: "#1a1a1a",
          marginBottom: "12px",
        }}>
          Comment tu{" "}
          <span style={{
            fontStyle: "italic",
            fontWeight: 500,
            background: "linear-gradient(135deg, #f97316, #ec4899, #a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>t'appelles</span> ?
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: "16px",
          color: "#888",
          lineHeight: 1.6,
          marginBottom: "40px",
        }}>
          Pour que je puisse te parler directement.
        </p>

        {/* Input */}
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleContinue()}
          placeholder="Ton prénom"
          autoFocus
          style={{
            width: "100%",
            padding: "18px 24px",
            fontSize: "18px",
            fontWeight: 500,
            fontFamily: "inherit",
            border: "2px solid #e5e5e5",
            borderRadius: "16px",
            outline: "none",
            textAlign: "center",
            color: "#1a1a1a",
            transition: "border-color 0.2s",
            boxSizing: "border-box",
            background: "#fafafa",
          }}
          onFocus={(e) => e.target.style.borderColor = "#1a1a1a"}
          onBlur={(e) => e.target.style.borderColor = "#e5e5e5"}
        />

        {/* CTA */}
        <button
          onClick={handleContinue}
          disabled={!firstName.trim() || loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
            marginTop: "20px",
            padding: "16px 32px",
            background: firstName.trim() ? "#1a1a1a" : "#d4d4d4",
            color: "#fff",
            border: "none",
            borderRadius: "100px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: firstName.trim() ? "pointer" : "not-allowed",
            fontFamily: "inherit",
            transition: "all 0.2s",
          }}
          onMouseOver={e => { if (firstName.trim()) e.currentTarget.style.opacity = "0.85"; }}
          onMouseOut={e => e.currentTarget.style.opacity = "1"}
        >
          {loading ? "Un instant..." : <>Continuer <ArrowRight size={16} /></>}
        </button>

        {/* Reassurance */}
        <p style={{
          fontSize: "13px",
          color: "#bbb",
          marginTop: "24px",
        }}>
          5 minutes · 100% personnalisé · Tes données restent privées
        </p>
      </div>
    </div>
  );
}