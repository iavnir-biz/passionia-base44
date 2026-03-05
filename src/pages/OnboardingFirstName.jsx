import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight } from "lucide-react";

const steps = [
  { num: "01", title: "On valide ton idée ensemble", desc: "Je vérifie si ta passion peut se vendre — avec de la vraie demande." },
  { num: "02", title: "On estime ton potentiel", desc: "Combien tu peux générer, avec ton savoir et ton marché." },
  { num: "03", title: "Je crée tes 4 offres", desc: "Offres, prix, page de vente, messages, emails — tout est prêt." },
  { num: "04", title: "Ton plan d'action sur 7 jours", desc: "Une action par jour. Tu sais exactement quoi faire." },
];

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#ffffff",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "60px 24px 48px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: "560px", width: "100%", textAlign: "center" }}>

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
          Ton associé IA pour lancer ton business
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: "clamp(32px, 5vw, 48px)",
          fontWeight: 400,
          lineHeight: 1.15,
          letterSpacing: "-0.03em",
          color: "#1a1a1a",
          marginBottom: "16px",
        }}>
          Salut, moi c'est{" "}
          <span style={{
            fontStyle: "italic",
            fontWeight: 500,
            background: "linear-gradient(135deg, #f97316, #ec4899, #a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>Noah</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: "17px",
          color: "#888",
          lineHeight: 1.6,
          maxWidth: "460px",
          margin: "0 auto 48px",
        }}>
          À partir de maintenant, on construit <strong style={{ color: "#1a1a1a" }}>ensemble</strong> ton activité en ligne.
        </p>

        {/* Sub-heading */}
        <p style={{
          fontSize: "13px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          color: "#999",
          marginBottom: "32px",
        }}>
          Voici comment on va travailler
        </p>

        {/* Steps timeline */}
        <div style={{
          position: "relative",
          maxWidth: "420px",
          margin: "0 auto",
          textAlign: "left",
        }}>
          {/* Track line */}
          <div style={{
            position: "absolute",
            left: "15px",
            top: "8px",
            bottom: "8px",
            width: "2px",
            background: "#e5e5e5",
            borderRadius: "2px",
          }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "24px",
                position: "relative",
              }}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "#1a1a1a",
                  border: "2px solid #1a1a1a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  zIndex: 1,
                }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#fff" }}>{s.num}</span>
                </div>
                <div style={{ paddingTop: "4px" }}>
                  <h3 style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    marginBottom: "6px",
                    letterSpacing: "-0.01em",
                    color: "#1a1a1a",
                    margin: "0 0 6px",
                  }}>{s.title}</h3>
                  <p style={{
                    fontSize: "14px",
                    color: "#888",
                    lineHeight: 1.6,
                    margin: 0,
                  }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reassurance */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
          marginTop: "48px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}>
          {["100% gratuit", "5 minutes", "Personnalisé"].map((text, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
              <span style={{ fontSize: "13px", color: "#999", fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate(createPageUrl("OnboardingFirstName"))}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "16px 32px",
            background: "#1a1a1a",
            color: "#fff",
            border: "none",
            borderRadius: "100px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "opacity 0.2s",
            whiteSpace: "nowrap",
          }}
          onMouseOver={e => e.currentTarget.style.opacity = "0.85"}
          onMouseOut={e => e.currentTarget.style.opacity = "1"}
        >
          Commencer avec Noah <ArrowRight size={16} />
        </button>

        {/* Micro social proof */}
        <p style={{
          fontSize: "13px",
          color: "#bbb",
          marginTop: "20px",
        }}>
          Rejoins les entrepreneurs qui monétisent déjà leur savoir.
        </p>
      </div>
    </div>
  );
}