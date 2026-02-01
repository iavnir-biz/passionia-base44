import { useState } from "react";

const SparkleIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const TargetIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);

const TrendingIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
  </svg>
);

const FileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const RocketIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3dd67a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);

const steps = [
  {
    icon: <TargetIcon />,
    color: "#3b82f6",
    bgColor: "rgba(59, 130, 246, 0.08)",
    title: "Validation de ton idée",
    desc: "On vérifie si ta passion peut réellement se vendre en ligne, dans ta niche.",
  },
  {
    icon: <TrendingIcon />,
    color: "#ec4899",
    bgColor: "rgba(236, 72, 153, 0.08)",
    title: "Ton potentiel de revenus",
    desc: "Estimation personnalisée basée sur ton savoir, ton vécu et ton marché.",
  },
  {
    icon: <FileIcon />,
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.08)",
    title: "Tes 4 offres idéales",
    desc: "Offres complètes avec prix, page de vente, messages et emails — générés pour toi.",
  },
  {
    icon: <RocketIcon />,
    color: "#22c55e",
    bgColor: "rgba(34, 197, 94, 0.08)",
    title: "Ton plan d'action",
    desc: "Semaine par semaine, une action par jour, jusqu'à ta première vente.",
  },
];

export default function TeaserPage() {
  const [hoveredStep, setHoveredStep] = useState(null);

  return (
    <div style={{
      height: "100vh",
      background: "#ffffff",
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap" rel="stylesheet" />

      {/* Header */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #61f7a2, #3dd67a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(97,247,162,0.25)",
          }}>
            <SparkleIcon size={16} color="white" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "15px", fontWeight: 800, color: "#111", letterSpacing: "-0.02em" }}>
              PassionIA
            </span>
            <span style={{ fontSize: "10px", fontWeight: 500, color: "#999", letterSpacing: "0" }}>
              Transforme ton savoir en business
            </span>
          </div>
        </div>
        
        {/* Boutons desktop */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}>
          <a
            href="#connexion"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "8px 20px",
              background: "white",
              color: "#111",
              border: "2px solid #111",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = "#f5f5f5";
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = "white";
            }}
          >
            Connexion
          </a>
          
          <a
            href="#demarrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "8px 24px",
              background: "linear-gradient(135deg, #1a1a1a, #000)",
              color: "white",
              border: "none",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              textDecoration: "none",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            }}
            onMouseOver={e => {
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(97,247,162,0.4)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseOut={e => {
              e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Démarrer gratuitement
          </a>
        </div>
      </header>

      {/* Contenu principal */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 20px",
        maxWidth: "900px",
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box",
      }}>

        {/* ━━━ Hero ━━━ */}
        <div style={{
          textAlign: "center",
          marginBottom: "20px",
          animation: "fadeInUp 0.5s ease-out",
        }}>
          {/* Emoji + badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: "999px",
            padding: "4px 12px 4px 6px",
            marginBottom: "12px",
            animation: "fadeInUp 0.5s ease-out 0.1s both",
          }}>
            <span style={{ fontSize: "16px" }}>🎯</span>
            <span style={{ fontSize: "12px", color: "#666", fontWeight: 600 }}>
              Prêt à découvrir ton potentiel
            </span>
          </div>

          <h1 style={{
            fontSize: "22px",
            fontWeight: 800,
            color: "#111",
            margin: "0 0 8px",
            lineHeight: 1.2,
            letterSpacing: "-0.03em",
            animation: "fadeInUp 0.5s ease-out 0.15s both",
          }}>
            Voici ce que Noah va<br />
            <span style={{ color: "#3dd67a" }}>générer pour toi</span>
          </h1>

          <p style={{
            fontSize: "13px",
            color: "#999",
            margin: 0,
            lineHeight: 1.4,
            animation: "fadeInUp 0.5s ease-out 0.25s both",
          }}>
            En quelques questions simples, notre IA crée tout ce dont tu as besoin pour lancer ton activité.
          </p>
        </div>

        {/* ━━━ Les 4 blocs ━━━ */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "10px",
          width: "100%",
          marginBottom: "20px",
        }}>
          {steps.map((step, i) => (
            <div
              key={i}
              onMouseOver={() => setHoveredStep(i)}
              onMouseOut={() => setHoveredStep(null)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                background: "rgba(255,255,255,0.4)",
                backdropFilter: "blur(20px)",
                borderRadius: "14px",
                padding: "14px 16px",
                border: hoveredStep === i ? `1.5px solid ${step.color}30` : "1.5px solid rgba(0,0,0,0.06)",
                transition: "all 0.25s ease",
                cursor: "default",
                boxShadow: hoveredStep === i ? `0 4px 16px ${step.color}15` : "0 1px 3px rgba(0,0,0,0.02)",
                animation: `fadeInUp 0.5s ease-out ${0.3 + i * 0.08}s both`,
              }}
            >
              {/* Numéro + Icône */}
              <div style={{
                position: "relative",
                flexShrink: 0,
              }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: step.bgColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: step.color,
                  transition: "transform 0.2s",
                  transform: hoveredStep === i ? "scale(1.05)" : "scale(1)",
                }}>
                  {step.icon}
                </div>
                {/* Petit numéro */}
                <div style={{
                  position: "absolute",
                  top: "-3px",
                  right: "-3px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "5px",
                  background: "#111",
                  color: "white",
                  fontSize: "9px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid white",
                }}>
                  {i + 1}
                </div>
              </div>

              {/* Texte */}
              <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
                <h3 style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#111",
                  margin: "0 0 3px",
                  letterSpacing: "-0.01em",
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: "11px",
                  color: "#999",
                  margin: 0,
                  lineHeight: 1.4,
                }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ━━━ Réassurance ━━━ */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "14px",
          marginBottom: "16px",
          animation: "fadeInUp 0.5s ease-out 0.7s both",
        }}>
          {["100% gratuit", "60 secondes", "Personnalisé"].map((text, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}>
              <CheckIcon />
              <span style={{ fontSize: "11px", color: "#aaa", fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* ━━━ Bouton CTA ━━━ */}
        <a
          href="#LIEN_VERS_GENERATEUR"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            maxWidth: "400px",
            width: "100%",
            padding: "14px 24px",
            background: "linear-gradient(135deg, #1a1a1a, #000)",
            color: "white",
            border: "none",
            borderRadius: "14px",
            fontSize: "15px",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            textDecoration: "none",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            letterSpacing: "-0.01em",
            animation: "fadeInUp 0.5s ease-out 0.75s both",
            boxSizing: "border-box",
          }}
          onMouseOver={e => {
            e.currentTarget.style.boxShadow = "0 4px 24px rgba(97,247,162,0.4), 0 4px 16px rgba(0,0,0,0.2)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseOut={e => {
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <SparkleIcon size={18} color="#61f7a2" />
          C'est parti
          <ArrowIcon />
        </a>

        {/* Micro-texte */}
        <p style={{
          fontSize: "11px",
          color: "#ccc",
          marginTop: "10px",
          textAlign: "center",
          animation: "fadeInUp 0.5s ease-out 0.85s both",
        }}>
          Aucune carte bancaire · Aucune compétence technique requise
        </p>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}