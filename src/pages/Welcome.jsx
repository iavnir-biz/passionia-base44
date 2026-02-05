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
    title: "Je valide ton idée",
    desc: "Je vérifie si ta passion peut réellement se vendre, dans ta niche, avec de la vraie demande.",
  },
  {
    icon: <TrendingIcon />,
    color: "#ec4899",
    bgColor: "rgba(236, 72, 153, 0.08)",
    title: "J'estime tes revenus",
    desc: "Je calcule combien tu peux générer avec ton savoir, ton vécu et ton marché.",
  },
  {
    icon: <FileIcon />,
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.08)",
    title: "Je crée tes 4 offres",
    desc: "Offres complètes avec les prix, ta page de vente, tes messages et emails — tout est prêt.",
  },
  {
    icon: <RocketIcon />,
    color: "#22c55e",
    bgColor: "rgba(34, 197, 94, 0.08)",
    title: "Je construis ton plan d'action",
    desc: "Semaine par semaine, une action par jour. Tu sais exactement quoi faire.",
  },
];

export default function TeaserPage() {
  const [hoveredStep, setHoveredStep] = useState(null);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#fafafa",
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      display: "flex",
      flexDirection: "column",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap" rel="stylesheet" />



      {/* Contenu principal */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px 16px 40px",
        maxWidth: "440px",
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box",
      }}>

        {/* ━━━ Hero ━━━ */}
        <div style={{
          textAlign: "center",
          marginBottom: "32px",
          animation: "fadeInUp 0.5s ease-out",
        }}>
          {/* Avatar Noah - Cerveau stylisé */}
          <div style={{
            position: "relative",
            display: "inline-flex",
            marginBottom: "20px",
            animation: "fadeInUp 0.5s ease-out 0.1s both",
          }}>
            <div style={{
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #b8f5d0, #8ef0b3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(97,247,162,0.2)",
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4C8.5 4 6 6.5 6 9.5C6 11.5 7 13 8.5 14C8.5 14 8 15.5 8 17C8 18.5 9 20 12 20C15 20 16 18.5 16 17C16 15.5 15.5 14 15.5 14C17 13 18 11.5 18 9.5C18 6.5 15.5 4 12 4Z" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 4V20" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M8.5 8.5C9.5 9 10.5 9 12 9C13.5 9 14.5 9 15.5 8.5" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M8.5 12C9.5 12.5 10.5 12.5 12 12.5C13.5 12.5 14.5 12.5 15.5 12" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            {/* Dot vert qui pulse */}
            <div style={{
              position: "absolute",
              bottom: "2px",
              right: "2px",
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              background: "#3dd67a",
              border: "2px solid #fafafa",
              animation: "pulse 2s ease-in-out infinite",
            }} />
          </div>

          <h1 style={{
            fontSize: "26px",
            fontWeight: 800,
            color: "#111",
            margin: "0 0 10px",
            lineHeight: 1.2,
            letterSpacing: "-0.03em",
            animation: "fadeInUp 0.5s ease-out 0.15s both",
          }}>
            Hello 👋 Moi c'est Noah.
          </h1>

          <p style={{
            fontSize: "14px",
            color: "#999",
            margin: "0 0 16px",
            lineHeight: 1.5,
            animation: "fadeInUp 0.5s ease-out 0.25s both",
          }}>
            Je suis ton copilote IA. En quelques minutes, je vais analyser ton potentiel et tout créer pour toi.
          </p>

          <p style={{
            fontSize: "15px",
            color: "#111",
            margin: 0,
            fontWeight: 600,
            animation: "fadeInUp 0.5s ease-out 0.3s both",
          }}>
            Voici le programme :
          </p>
        </div>

        {/* ━━━ Les 4 blocs ━━━ */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "100%",
          marginBottom: "32px",
        }}>
          {steps.map((step, i) => (
            <div
              key={i}
              onMouseOver={() => setHoveredStep(i)}
              onMouseOut={() => setHoveredStep(null)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "16px",
                background: "white",
                borderRadius: "16px",
                padding: "18px 20px",
                border: hoveredStep === i ? `1.5px solid ${step.color}20` : "1.5px solid #f0f0f0",
                transition: "all 0.25s ease",
                cursor: "default",
                boxShadow: hoveredStep === i ? `0 4px 16px ${step.color}10` : "0 1px 3px rgba(0,0,0,0.03)",
                animation: `fadeInUp 0.5s ease-out ${0.3 + i * 0.08}s both`,
              }}
            >
              {/* Numéro + Icône */}
              <div style={{
                position: "relative",
                flexShrink: 0,
              }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
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
                  top: "-4px",
                  right: "-4px",
                  width: "18px",
                  height: "18px",
                  borderRadius: "6px",
                  background: "#111",
                  color: "white",
                  fontSize: "10px",
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
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#111",
                  margin: "0 0 3px",
                  letterSpacing: "-0.01em",
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: "13px",
                  color: "#999",
                  margin: 0,
                  lineHeight: 1.45,
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
          gap: "16px",
          marginBottom: "24px",
          animation: "fadeInUp 0.5s ease-out 0.7s both",
        }}>
          {["100% gratuit", "5 minutes", "Personnalisé"].map((text, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}>
              <CheckIcon />
              <span style={{ fontSize: "12px", color: "#aaa", fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* ━━━ Bouton CTA ━━━ */}
        <a
          href="/OnboardingFirstName"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            width: "100%",
            padding: "18px 24px",
            background: "linear-gradient(135deg, #1a1a1a, #000)",
            color: "white",
            border: "none",
            borderRadius: "16px",
            fontSize: "17px",
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
          C'est parti 🚀
        </a>


      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }


      `}</style>
    </div>
  );
}