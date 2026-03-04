import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function LandingNoah() {
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({
              ...prev,
              [entry.target.dataset.section]: true,
            }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const addRef = (el, index) => {
    sectionRefs.current[index] = el;
  };

  const handleCTA = () => {
    base44.auth.redirectToLogin(window.location.origin + '/OnboardingFirstName');
  };

  return (
    <div style={{ 
      fontFamily: "'DM Sans', sans-serif",
      color: '#0A0A0A',
      backgroundColor: '#FFFFFF',
      minHeight: '100vh',
      overflowX: 'hidden'
    }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* BARRE D'URGENCE */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: '#0A0A0A',
        color: '#FFFFFF',
        padding: '12px 20px',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: 500
      }}>
        <span>-20€ immédiat — Offre valable jusqu'au 4 à minuit </span>
        <a 
          href="#pricing" 
          style={{ 
            color: '#FFFFFF', 
            textDecoration: 'underline',
            marginLeft: '8px',
            fontWeight: 600
          }}
        >
          👉 Obtenir le coupon
        </a>
      </div>

      {/* SECTION HERO */}
      <section
        ref={(el) => addRef(el, 0)}
        data-section="hero"
        style={{
          padding: '120px 24px 100px',
          maxWidth: '900px',
          margin: '0 auto',
          textAlign: 'center',
          opacity: visibleSections.hero ? 1 : 0,
          transform: visibleSections.hero ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease'
        }}
      >
        {/* Badge */}
        <p style={{
          fontSize: '12px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: '#6B6B6B',
          marginBottom: '32px'
        }}>
          Pour ceux qui ont un savoir-faire et veulent le monétiser simplement
        </p>

        {/* Titre H1 */}
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 600,
          lineHeight: 1.2,
          marginBottom: '28px',
          color: '#0A0A0A'
        }}>
          Le système NOAH™ génère tes 4 offres et t'aide à faire ta première vente en 24h — pour viser +4 000€/mois
        </h1>

        {/* Sous-titre */}
        <p style={{
          fontSize: '18px',
          color: '#6B6B6B',
          lineHeight: 1.6,
          maxWidth: '680px',
          margin: '0 auto 40px'
        }}>
          Si ton savoir-faire reste dans ta tête, il ne te rapporte rien. NOAH™ transforme ce que tu sais en offres structurées, prêtes à vendre — en quelques minutes.
        </p>

        {/* CTA Principal */}
        <button
          onClick={handleCTA}
          style={{
            backgroundColor: '#4A7C59',
            color: '#FFFFFF',
            border: 'none',
            padding: '18px 48px',
            fontSize: '16px',
            fontWeight: 600,
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontFamily: "'DM Sans', sans-serif"
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#3d6a4a'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#4A7C59'}
        >
          Commencer gratuitement →
        </button>

        <p style={{
          fontSize: '13px',
          color: '#6B6B6B',
          marginTop: '16px'
        }}>
          Analyse gratuite • Résultats en 5 min
        </p>
      </section>

      {/* SECTION PROBLÈME */}
      <section
        ref={(el) => addRef(el, 1)}
        data-section="problem"
        style={{
          padding: '100px 24px',
          backgroundColor: '#FAFAFA',
          opacity: visibleSections.problem ? 1 : 0,
          transform: visibleSections.problem ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease'
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{
            fontSize: '12px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#6B6B6B',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            Le problème
          </p>

          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 500,
            lineHeight: 1.3,
            textAlign: 'center',
            marginBottom: '48px'
          }}>
            Tu as un talent. Mais tu ne sais pas comment le vendre.
          </h2>

          <div style={{
            display: 'grid',
            gap: '24px'
          }}>
            {[
              "Tu sais que tu pourrais aider des gens — mais tu ne sais pas quoi proposer exactement.",
              "Tu as déjà pensé à créer une formation, un coaching... mais tu bloques sur le \"comment\".",
              "Tu vois d'autres le faire. Et tu te demandes : \"Pourquoi pas moi ?\""
            ].map((text, i) => (
              <div key={i} style={{
                padding: '28px 32px',
                backgroundColor: '#FFFFFF',
                borderLeft: '3px solid #4A7C59',
                fontSize: '17px',
                lineHeight: 1.6,
                color: '#0A0A0A'
              }}>
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION SOLUTION */}
      <section
        ref={(el) => addRef(el, 2)}
        data-section="solution"
        style={{
          padding: '100px 24px',
          opacity: visibleSections.solution ? 1 : 0,
          transform: visibleSections.solution ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease'
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{
            fontSize: '12px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#6B6B6B',
            marginBottom: '24px'
          }}>
            La solution
          </p>

          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 500,
            lineHeight: 1.3,
            marginBottom: '24px'
          }}>
            NOAH™ fait le travail pour toi.
          </h2>

          <p style={{
            fontSize: '18px',
            color: '#6B6B6B',
            lineHeight: 1.6,
            maxWidth: '650px',
            margin: '0 auto 64px'
          }}>
            En quelques minutes, tu réponds à quelques questions simples. L'IA analyse ton savoir-faire et génère un système complet d'offres — structuré, tarifé, prêt à vendre.
          </p>

          {/* Les 4 piliers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '32px',
            textAlign: 'left'
          }}>
            {[
              { num: '01', title: 'Produit Principal', desc: 'Ton offre d\'entrée accessible (27-97€)' },
              { num: '02', title: 'Petit Extra', desc: 'Un bonus irrésistible ajouté au panier' },
              { num: '03', title: 'Offre Supérieure', desc: 'Pour ceux qui veulent aller plus loin' },
              { num: '04', title: 'Premium', desc: 'Ton accompagnement haut de gamme' }
            ].map((item, i) => (
              <div key={i} style={{ padding: '8px 0' }}>
                <span style={{
                  fontSize: '12px',
                  color: '#4A7C59',
                  fontWeight: 600,
                  letterSpacing: '1px'
                }}>
                  {item.num}
                </span>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '22px',
                  fontWeight: 500,
                  margin: '8px 0 12px',
                  color: '#0A0A0A'
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#6B6B6B',
                  lineHeight: 1.5
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION COMMENT ÇA MARCHE */}
      <section
        ref={(el) => addRef(el, 3)}
        data-section="how"
        style={{
          padding: '100px 24px',
          backgroundColor: '#FAFAFA',
          opacity: visibleSections.how ? 1 : 0,
          transform: visibleSections.how ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease'
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{
            fontSize: '12px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#6B6B6B',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            Comment ça marche
          </p>

          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 500,
            lineHeight: 1.3,
            textAlign: 'center',
            marginBottom: '64px'
          }}>
            3 étapes. 5 minutes. Tout est prêt.
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {[
              { step: '1', title: 'Tu réponds à quelques questions', desc: 'NOAH™ te pose des questions simples sur ton savoir-faire, ton audience idéale, et tes objectifs.' },
              { step: '2', title: 'L\'IA génère ton système d\'offres', desc: 'En quelques secondes, tu obtiens 4 offres structurées avec prix, description et positionnement.' },
              { step: '3', title: 'Tu lances ta première vente', desc: 'Avec ton plan d\'action personnalisé, tu sais exactement quoi faire pour vendre dès cette semaine.' }
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: '32px',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#4A7C59',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 600,
                  flexShrink: 0
                }}>
                  {item.step}
                </div>
                <div>
                  <h3 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '24px',
                    fontWeight: 500,
                    marginBottom: '12px',
                    color: '#0A0A0A'
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    color: '#6B6B6B',
                    lineHeight: 1.6
                  }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION CE QUE TU OBTIENS */}
      <section
        ref={(el) => addRef(el, 4)}
        data-section="includes"
        style={{
          padding: '100px 24px',
          opacity: visibleSections.includes ? 1 : 0,
          transform: visibleSections.includes ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease'
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{
            fontSize: '12px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#6B6B6B',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            Ce que tu obtiens
          </p>

          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 500,
            lineHeight: 1.3,
            textAlign: 'center',
            marginBottom: '64px'
          }}>
            Tout ce dont tu as besoin pour lancer
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {[
              { title: '4 offres complètes', desc: 'Structurées, tarifées, positionnées — prêtes à vendre' },
              { title: 'Page de vente', desc: 'Texte de vente généré pour convertir tes visiteurs' },
              { title: 'Emails marketing', desc: '5 emails prêts à envoyer pour ta séquence de lancement' },
              { title: 'Messages de vente', desc: 'Scripts pour réseaux sociaux et conversations' },
              { title: 'Analyse de marché', desc: 'Validation de ton idée avec données concrètes' },
              { title: 'Plan d\'action 7 jours', desc: 'Étape par étape, une action par jour' }
            ].map((item, i) => (
              <div key={i} style={{
                padding: '32px',
                border: '1px solid #E8E8E8',
                borderRadius: '4px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#4A7C59',
                  marginBottom: '20px'
                }} />
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '20px',
                  fontWeight: 500,
                  marginBottom: '12px',
                  color: '#0A0A0A'
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#6B6B6B',
                  lineHeight: 1.5
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION TÉMOIGNAGES */}
      <section
        ref={(el) => addRef(el, 5)}
        data-section="testimonials"
        style={{
          padding: '100px 24px',
          backgroundColor: '#FAFAFA',
          opacity: visibleSections.testimonials ? 1 : 0,
          transform: visibleSections.testimonials ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease'
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{
            fontSize: '12px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#6B6B6B',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            Ils l'ont fait
          </p>

          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 500,
            lineHeight: 1.3,
            textAlign: 'center',
            marginBottom: '64px'
          }}>
            Ce qu'ils disent de NOAH™
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px'
          }}>
            {[
              { quote: "En 10 minutes, j'avais mes 4 offres structurées. J'ai fait ma première vente 3 jours après.", name: "Marie L.", role: "Coach bien-être" },
              { quote: "Je tournais en rond depuis 6 mois. NOAH™ m'a débloqué en une soirée. Incroyable.", name: "Thomas R.", role: "Formateur Excel" },
              { quote: "Le plan d'action est ultra concret. Je savais exactement quoi faire chaque jour.", name: "Sophie M.", role: "Experte nutrition" }
            ].map((item, i) => (
              <div key={i} style={{
                padding: '32px',
                backgroundColor: '#FFFFFF',
                borderRadius: '4px'
              }}>
                <p style={{
                  fontSize: '17px',
                  lineHeight: 1.6,
                  color: '#0A0A0A',
                  marginBottom: '24px',
                  fontStyle: 'italic'
                }}>
                  "{item.quote}"
                </p>
                <div>
                  <p style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#0A0A0A',
                    marginBottom: '4px'
                  }}>
                    {item.name}
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: '#6B6B6B'
                  }}>
                    {item.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION PRICING */}
      <section
        id="pricing"
        ref={(el) => addRef(el, 6)}
        data-section="pricing"
        style={{
          padding: '100px 24px',
          opacity: visibleSections.pricing ? 1 : 0,
          transform: visibleSections.pricing ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease'
        }}
      >
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{
            fontSize: '12px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#6B6B6B',
            marginBottom: '24px'
          }}>
            Tarif
          </p>

          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 500,
            lineHeight: 1.3,
            marginBottom: '48px'
          }}>
            Commence maintenant
          </h2>

          {/* Carte prix */}
          <div style={{
            padding: '48px 40px',
            border: '2px solid #0A0A0A',
            borderRadius: '8px',
            marginBottom: '32px'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#6B6B6B',
              marginBottom: '16px',
              textDecoration: 'line-through'
            }}>
              Valeur totale : 497€
            </p>
            
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '56px',
                fontWeight: 600,
                color: '#0A0A0A'
              }}>
                47€
              </span>
              <span style={{
                fontSize: '18px',
                color: '#6B6B6B'
              }}>
                paiement unique
              </span>
            </div>

            <p style={{
              fontSize: '14px',
              color: '#4A7C59',
              fontWeight: 600,
              marginBottom: '32px'
            }}>
              → 27€ avec le coupon -20€
            </p>

            <button
              onClick={handleCTA}
              style={{
                width: '100%',
                backgroundColor: '#4A7C59',
                color: '#FFFFFF',
                border: 'none',
                padding: '18px 48px',
                fontSize: '16px',
                fontWeight: 600,
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: "'DM Sans', sans-serif",
                marginBottom: '16px'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#3d6a4a'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#4A7C59'}
            >
              Obtenir NOAH™ maintenant →
            </button>

            <p style={{
              fontSize: '13px',
              color: '#6B6B6B'
            }}>
              Accès immédiat • Garantie 30 jours
            </p>
          </div>

          {/* Liste inclus */}
          <div style={{ textAlign: 'left' }}>
            {[
              '4 offres complètes générées par IA',
              'Page de vente personnalisée',
              '5 emails marketing prêts à l\'emploi',
              'Scripts de vente pour réseaux sociaux',
              'Analyse et validation de marché',
              'Plan d\'action 7 jours'
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 0',
                borderBottom: i < 5 ? '1px solid #E8E8E8' : 'none'
              }}>
                <span style={{ color: '#4A7C59', fontSize: '18px' }}>✓</span>
                <span style={{ fontSize: '15px', color: '#0A0A0A' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION GARANTIE */}
      <section
        ref={(el) => addRef(el, 7)}
        data-section="guarantee"
        style={{
          padding: '80px 24px',
          backgroundColor: '#FAFAFA',
          opacity: visibleSections.guarantee ? 1 : 0,
          transform: visibleSections.guarantee ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease'
        }}
      >
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '28px',
            fontWeight: 500,
            marginBottom: '20px'
          }}>
            Garantie 30 jours — satisfait ou remboursé
          </h3>
          <p style={{
            fontSize: '16px',
            color: '#6B6B6B',
            lineHeight: 1.6
          }}>
            Si NOAH™ ne t'aide pas à structurer ton offre et avancer vers ta première vente, 
            tu es remboursé intégralement. Pas de questions. Pas de conditions.
          </p>
        </div>
      </section>

      {/* SECTION FAQ */}
      <section
        ref={(el) => addRef(el, 8)}
        data-section="faq"
        style={{
          padding: '100px 24px',
          opacity: visibleSections.faq ? 1 : 0,
          transform: visibleSections.faq ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease'
        }}
      >
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 500,
            lineHeight: 1.3,
            textAlign: 'center',
            marginBottom: '64px'
          }}>
            Questions fréquentes
          </h2>

          {[
            { q: "Je n'ai pas encore d'idée précise, ça fonctionne quand même ?", a: "Oui. NOAH™ te pose les bonnes questions pour faire émerger ton savoir-faire et le structurer en offres vendables." },
            { q: "Combien de temps ça prend ?", a: "L'analyse prend 5 minutes. La génération de tes offres est instantanée. Tu peux lancer ta première action dans l'heure." },
            { q: "Et si ça ne marche pas pour moi ?", a: "Tu as 30 jours pour tester. Si tu n'es pas satisfait, tu es remboursé intégralement — sans justification." },
            { q: "J'ai besoin de compétences techniques ?", a: "Aucune. Si tu sais répondre à des questions simples, tu sais utiliser NOAH™." },
            { q: "C'est vraiment pour moi si je débute ?", a: "Surtout si tu débutes. NOAH™ est conçu pour ceux qui n'ont jamais vendu leur savoir-faire mais veulent se lancer." }
          ].map((item, i) => (
            <FAQItem key={i} question={item.q} answer={item.a} />
          ))}
        </div>
      </section>

      {/* SECTION CTA FINAL */}
      <section
        ref={(el) => addRef(el, 9)}
        data-section="final"
        style={{
          padding: '100px 24px',
          backgroundColor: '#0A0A0A',
          color: '#FFFFFF',
          textAlign: 'center',
          opacity: visibleSections.final ? 1 : 0,
          transform: visibleSections.final ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease'
        }}
      >
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 500,
            lineHeight: 1.3,
            marginBottom: '24px'
          }}>
            Prêt à transformer ton savoir-faire en revenus ?
          </h2>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.6,
            marginBottom: '40px'
          }}>
            Rejoins les créateurs qui ont déjà utilisé NOAH™ pour lancer leur activité.
          </p>
          <button
            onClick={handleCTA}
            style={{
              backgroundColor: '#4A7C59',
              color: '#FFFFFF',
              border: 'none',
              padding: '18px 48px',
              fontSize: '16px',
              fontWeight: 600,
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: "'DM Sans', sans-serif"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#5a8c69'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#4A7C59'}
          >
            Commencer maintenant — 27€ →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: '40px 24px',
        backgroundColor: '#0A0A0A',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.5)'
        }}>
          © 2024 NOAH™ — Tous droits réservés
        </p>
      </footer>
    </div>
  );
}

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{
      borderBottom: '1px solid #E8E8E8',
      padding: '24px 0'
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          padding: 0,
          fontFamily: "'DM Sans', sans-serif"
        }}
      >
        <span style={{
          fontSize: '17px',
          fontWeight: 500,
          color: '#0A0A0A',
          paddingRight: '24px'
        }}>
          {question}
        </span>
        <span style={{
          fontSize: '24px',
          color: '#6B6B6B',
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0)'
        }}>
          +
        </span>
      </button>
      <div style={{
        maxHeight: isOpen ? '200px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.3s ease'
      }}>
        <p style={{
          fontSize: '15px',
          color: '#6B6B6B',
          lineHeight: 1.6,
          paddingTop: '16px'
        }}>
          {answer}
        </p>
      </div>
    </div>
  );
}