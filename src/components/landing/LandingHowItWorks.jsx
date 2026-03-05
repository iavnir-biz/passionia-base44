import React, { useEffect, useRef, useState } from 'react';

export default function LandingHowItWorks() {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) e.target.classList.add('visible');
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionHeight = rect.height;
      const windowHeight = window.innerHeight;

      // Calculate progress from when section enters view to when it leaves
      const start = windowHeight * 0.7;
      const end = -sectionHeight * 0.3;
      const raw = (start - sectionTop) / (start - end);
      setProgress(Math.min(1, Math.max(0, raw)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const steps = [
    { num: '01', title: "Réponds à quelques questions", desc: "5 minutes pour décrire ton expertise et tes objectifs." },
    { num: '02', title: "NOAH™ analyse et génère", desc: "L'IA crée tes 4 offres, valide ton marché et rédige tous tes contenus." },
    { num: '03', title: "Lance ta première vente", desc: "Suis le plan d'action jour par jour et fais ta première vente." }
  ];

  return (
    <section ref={ref} className="landing-fade" style={{
      padding: '100px 24px',
      background: '#fff'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{
          fontSize: '13px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: '#999',
          marginBottom: '16px'
        }}>Comment ça marche</p>

        <h2 style={{
          fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: 400,
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
          marginBottom: '64px'
        }}>
          3 étapes. <span style={{ fontStyle: 'italic', fontWeight: 700 }}>5 minutes.</span><br />Tout est prêt.
        </h2>

        {/* Timeline */}
        <div style={{ position: 'relative', textAlign: 'left' }}>
          {/* Track line (background) */}
          <div style={{
            position: 'absolute',
            left: '15px',
            top: '8px',
            bottom: '8px',
            width: '2px',
            background: '#e5e5e5',
            borderRadius: '2px',
          }} />

          {/* Progress line (fills on scroll) */}
          <div style={{
            position: 'absolute',
            left: '15px',
            top: '8px',
            bottom: '8px',
            width: '2px',
            background: '#1a1a1a',
            borderRadius: '2px',
            transformOrigin: 'top',
            transform: `scaleY(${progress})`,
            transition: 'transform 0.1s ease-out',
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {steps.map((s, i) => {
              const stepThreshold = i / steps.length;
              const isActive = progress > stepThreshold;

              return (
                <div key={i}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '28px',
                    position: 'relative',
                  }}>
                    {/* Dot */}
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isActive ? '#1a1a1a' : '#fff',
                      border: `2px solid ${isActive ? '#1a1a1a' : '#d4d4d4'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.4s ease',
                      zIndex: 1,
                    }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: isActive ? '#fff' : '#bbb',
                        transition: 'color 0.4s ease',
                      }}>{s.num}</span>
                    </div>

                    {/* Content */}
                    <div style={{
                      paddingTop: '4px',
                      opacity: isActive ? 1 : 0.4,
                      transform: isActive ? 'translateY(0)' : 'translateY(4px)',
                      transition: 'all 0.5s ease',
                    }}>
                      <h3 style={{
                        fontSize: '20px',
                        fontWeight: 600,
                        marginBottom: '8px',
                        letterSpacing: '-0.01em',
                        color: '#1a1a1a',
                      }}>{s.title}</h3>
                      <p style={{
                        fontSize: '15px',
                        color: '#888',
                        lineHeight: 1.6,
                        margin: 0,
                      }}>{s.desc}</p>
                    </div>
                  </div>

                  {/* Screenshot after step 01 or 02 */}
                  {(i === 0 || i === 1) && (
                    <div style={{
                      marginTop: '32px',
                      marginLeft: '60px',
                      perspective: '1200px',
                    }}>
                      <div style={{
                        background: '#ffffff',
                        borderRadius: '14px',
                        padding: '6px',
                        border: '1px solid #e5e5e5',
                        boxShadow: '0 24px 60px rgba(0,0,0,0.10), 0 6px 16px rgba(0,0,0,0.05)',
                        transform: 'rotateY(-8deg) rotateX(4deg)',
                        transformOrigin: 'center center',
                        maxWidth: '360px',
                      }}>
                        {/* Browser bar */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 10px',
                        }}>
                          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ff5f57' }} />
                          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#febc2e' }} />
                          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#28c840' }} />
                          <div style={{
                            flex: 1,
                            background: '#f5f5f5',
                            borderRadius: '5px',
                            padding: '3px 10px',
                            fontSize: '9px',
                            color: '#bbb',
                            marginLeft: '6px',
                            textAlign: 'center',
                          }}>
                            app.iavnir.fr
                          </div>
                        </div>
                        <img
                          src={i === 0
                            ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930250f9337193d59c1dcf5/b730b79e7_Capturedecran2026-03-05a194750.png"
                            : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930250f9337193d59c1dcf5/fe846192a_Capturedecran2026-03-05a195942.png"
                          }
                          alt={i === 0 ? "NOAH™ — Onboarding" : "NOAH™ — Offres générées"}
                          style={{
                            width: '100%',
                            borderRadius: '8px',
                            display: 'block',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}