import React, { useEffect, useRef } from 'react';
import { Check, Star, ArrowRight, Clock, Shield, Zap, Users, FileText, Mail, MessageSquare } from 'lucide-react';

export default function LandingNoah() {
  const sectionsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  const scrollToCTA = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-noah">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Playfair+Display:wght@400;500;600;700&display=swap');

        .landing-noah {
          font-family: 'DM Sans', sans-serif;
          color: #0A0A0A;
          background: #FFFFFF;
          line-height: 1.6;
        }

        .landing-noah h1, .landing-noah h2, .landing-noah h3 {
          font-family: 'Playfair Display', serif;
          font-weight: 600;
          line-height: 1.2;
        }

        .animate-section {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }

        .animate-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .text-accent { color: #4A7C59; }
        .bg-accent { background-color: #4A7C59; }
        .border-accent { border-color: #4A7C59; }
        .text-gray { color: #6B6B6B; }
        .text-deep { color: #0A0A0A; }

        .btn-primary {
          background-color: #4A7C59;
          color: white;
          padding: 18px 40px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .btn-primary:hover {
          background-color: #3d6a4a;
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: transparent;
          color: #0A0A0A;
          padding: 16px 36px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          border: 2px solid #0A0A0A;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          background: #0A0A0A;
          color: white;
        }

        .section-padding {
          padding: 100px 20px;
        }

        @media (max-width: 768px) {
          .section-padding {
            padding: 60px 16px;
          }
        }
      `}</style>

      {/* BARRE D'URGENCE */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#0A0A0A',
        padding: '12px 20px',
        textAlign: 'center'
      }}>
        <span style={{ color: 'white', fontSize: '14px', fontWeight: 500 }}>
          -20€ immédiat — Offre valable jusqu'au 4 à minuit
        </span>
        <button 
          onClick={scrollToCTA}
          style={{
            color: 'white',
            background: 'none',
            border: 'none',
            marginLeft: '16px',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          👉 Obtenir le coupon
        </button>
      </div>

      {/* SECTION HERO */}
      <section className="section-padding" style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
        <div ref={addToRefs} className="animate-section">
          <p style={{
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontSize: '12px',
            color: '#6B6B6B',
            marginBottom: '24px'
          }}>
            Pour ceux qui ont un savoir-faire et veulent le monétiser simplement
          </p>

          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            marginBottom: '24px',
            color: '#0A0A0A'
          }}>
            Le système NOAH™ génère tes 4 offres et t'aide à faire ta première vente en 24h — pour viser <span className="text-accent">+4 000€/mois</span>
          </h1>

          <p style={{
            fontSize: '18px',
            color: '#6B6B6B',
            maxWidth: '700px',
            margin: '0 auto 40px'
          }}>
            Si ton savoir-faire dort dans un coin de ta tête, NOAH™ le transforme en offres prêtes à vendre — avec les prix, les pages de vente, les emails et un plan d'action semaine par semaine.
          </p>

          <button className="btn-primary" onClick={scrollToCTA}>
            Découvrir NOAH™ <ArrowRight size={18} />
          </button>

          <p style={{ marginTop: '16px', fontSize: '13px', color: '#6B6B6B' }}>
            ✓ 100% gratuit pour commencer · ✓ Résultats en 5 minutes
          </p>
        </div>
      </section>

      {/* SECTION PROBLÈME */}
      <section className="section-padding" style={{ background: '#FAFAFA' }}>
        <div ref={addToRefs} className="animate-section" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', marginBottom: '40px' }}>
            Tu as un savoir-faire précieux...<br />mais tu ne sais pas comment le vendre
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px',
            textAlign: 'left',
            marginTop: '50px'
          }}>
            {[
              "Tu ne sais pas quel prix fixer",
              "Tu n'as pas de page de vente",
              "Tu ne sais pas par où commencer",
              "Tu as peur de ne pas être légitime",
              "Tu manques de temps pour tout créer",
              "Tu te perds dans la technique"
            ].map((problem, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <span style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#FEE2E2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '14px'
                }}>✗</span>
                <span style={{ color: '#6B6B6B' }}>{problem}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION SOLUTION */}
      <section className="section-padding">
        <div ref={addToRefs} className="animate-section" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p className="text-accent" style={{
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontSize: '12px',
            marginBottom: '16px',
            fontWeight: 600
          }}>
            La solution
          </p>

          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', marginBottom: '24px' }}>
            NOAH™ fait tout le travail stratégique pour toi
          </h2>

          <p style={{ color: '#6B6B6B', fontSize: '18px', maxWidth: '600px', margin: '0 auto 60px' }}>
            En quelques minutes, l'IA analyse ton expertise et génère un business complet, prêt à vendre.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '40px',
            textAlign: 'left'
          }}>
            {[
              {
                icon: <Zap size={28} />,
                title: "4 offres structurées",
                desc: "Produit principal, order bump, upsell et premium — avec les prix optimaux pour ton marché."
              },
              {
                icon: <FileText size={28} />,
                title: "Pages de vente complètes",
                desc: "Textes persuasifs générés automatiquement, prêts à copier-coller."
              },
              {
                icon: <Mail size={28} />,
                title: "Séquence emails",
                desc: "5 emails de vente rédigés pour convertir tes prospects en clients."
              },
              {
                icon: <MessageSquare size={28} />,
                title: "Messages de vente",
                desc: "Scripts pour réseaux sociaux et conversations directes."
              },
              {
                icon: <Users size={28} />,
                title: "Avatars clients",
                desc: "Profils détaillés de tes clients idéaux pour mieux les cibler."
              },
              {
                icon: <Clock size={28} />,
                title: "Plan d'action 7 jours",
                desc: "Étape par étape, tu sais exactement quoi faire chaque jour."
              }
            ].map((item, i) => (
              <div key={i} style={{
                padding: '30px',
                border: '1px solid #E5E5E5',
                borderRadius: '12px'
              }}>
                <div className="text-accent" style={{ marginBottom: '16px' }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '20px', marginBottom: '12px', fontFamily: 'DM Sans' }}>
                  {item.title}
                </h3>
                <p style={{ color: '#6B6B6B', fontSize: '15px' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION COMMENT ÇA MARCHE */}
      <section className="section-padding" style={{ background: '#FAFAFA' }}>
        <div ref={addToRefs} className="animate-section" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', marginBottom: '60px' }}>
            Comment ça marche ?
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {[
              { step: "1", title: "Réponds à quelques questions", desc: "5 minutes pour décrire ton expertise et tes objectifs" },
              { step: "2", title: "NOAH™ analyse et génère", desc: "L'IA crée tes 4 offres, valide ton marché et rédige tous tes contenus" },
              { step: "3", title: "Lance ta première vente", desc: "Suis le plan d'action jour par jour et fais ta première vente en 24h" }
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '24px',
                textAlign: 'left'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#4A7C59',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '20px',
                  flexShrink: 0
                }}>
                  {item.step}
                </div>
                <div>
                  <h3 style={{ fontSize: '22px', marginBottom: '8px', fontFamily: 'DM Sans', fontWeight: 600 }}>
                    {item.title}
                  </h3>
                  <p style={{ color: '#6B6B6B' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION TÉMOIGNAGES */}
      <section className="section-padding">
        <div ref={addToRefs} className="animate-section" style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', marginBottom: '60px' }}>
            Ils ont transformé leur expertise
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px'
          }}>
            {[
              {
                name: "Marie L.",
                role: "Coach en nutrition",
                text: "En 2 semaines, j'ai fait ma première vente à 297€. NOAH™ m'a donné la clarté qui me manquait depuis des mois.",
                stars: 5
              },
              {
                name: "Thomas B.",
                role: "Expert Excel",
                text: "Je pensais que mon savoir était trop « basique » pour être vendu. NOAH™ m'a prouvé le contraire — 1 200€ le premier mois.",
                stars: 5
              },
              {
                name: "Sophie M.",
                role: "Formatrice langue des signes",
                text: "Le plan d'action est incroyable. Chaque jour, je savais exactement quoi faire. Plus d'excuse pour procrastiner.",
                stars: 5
              }
            ].map((t, i) => (
              <div key={i} style={{
                padding: '32px',
                border: '1px solid #E5E5E5',
                borderRadius: '12px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                  {[...Array(t.stars)].map((_, j) => (
                    <Star key={j} size={18} fill="#4A7C59" color="#4A7C59" />
                  ))}
                </div>
                <p style={{ fontSize: '16px', marginBottom: '20px', fontStyle: 'italic' }}>
                  "{t.text}"
                </p>
                <div>
                  <p style={{ fontWeight: 600 }}>{t.name}</p>
                  <p style={{ color: '#6B6B6B', fontSize: '14px' }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION PRICING */}
      <section id="pricing" className="section-padding" style={{ background: '#FAFAFA' }}>
        <div ref={addToRefs} className="animate-section" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', marginBottom: '16px' }}>
            Accède à NOAH™ maintenant
          </h2>
          <p style={{ color: '#6B6B6B', marginBottom: '40px' }}>
            Paiement unique. Accès à vie. Mises à jour incluses.
          </p>

          <div style={{
            background: 'white',
            border: '2px solid #4A7C59',
            borderRadius: '16px',
            padding: '40px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-14px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#4A7C59',
              color: 'white',
              padding: '6px 20px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600
            }}>
              OFFRE LIMITÉE
            </div>

            <div style={{ marginBottom: '24px' }}>
              <span style={{ textDecoration: 'line-through', color: '#6B6B6B', fontSize: '24px' }}>67€</span>
              <span style={{ fontSize: '56px', fontWeight: 700, marginLeft: '12px' }}>47€</span>
            </div>

            <ul style={{ textAlign: 'left', marginBottom: '32px' }}>
              {[
                "Génération complète de tes 4 offres",
                "Pages de vente rédigées",
                "Séquence de 5 emails",
                "Messages de vente",
                "Avatars clients détaillés",
                "Plan d'action 7 jours",
                "Validation marché IA",
                "Accès à vie + mises à jour"
              ].map((item, i) => (
                <li key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 0',
                  borderBottom: i < 7 ? '1px solid #F0F0F0' : 'none'
                }}>
                  <Check size={20} className="text-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Accéder à NOAH™ — 47€ <ArrowRight size={18} />
            </button>

            <p style={{ marginTop: '16px', fontSize: '13px', color: '#6B6B6B' }}>
              🔒 Paiement sécurisé par Stripe
            </p>
          </div>
        </div>
      </section>

      {/* SECTION GARANTIE */}
      <section className="section-padding">
        <div ref={addToRefs} className="animate-section" style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <Shield size={48} className="text-accent" style={{ marginBottom: '24px' }} />
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', marginBottom: '16px' }}>
            Garantie satisfait ou remboursé 30 jours
          </h2>
          <p style={{ color: '#6B6B6B', fontSize: '18px' }}>
            Si NOAH™ ne t'aide pas à clarifier et structurer ton offre, on te rembourse intégralement. Sans question. Tu n'as rien à perdre.
          </p>
        </div>
      </section>

      {/* SECTION FAQ */}
      <section className="section-padding" style={{ background: '#FAFAFA' }}>
        <div ref={addToRefs} className="animate-section" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', marginBottom: '50px', textAlign: 'center' }}>
            Questions fréquentes
          </h2>

          {[
            {
              q: "J'ai besoin de compétences techniques ?",
              a: "Non. NOAH™ te guide pas à pas. Tu n'as qu'à répondre aux questions et copier-coller les contenus générés."
            },
            {
              q: "Combien de temps pour voir des résultats ?",
              a: "La génération prend 5 minutes. Avec le plan d'action, tu peux faire ta première vente en 24h à 7 jours."
            },
            {
              q: "Mon domaine est-il compatible ?",
              a: "Si tu as une expertise que d'autres veulent apprendre (cuisine, langues, fitness, business, créativité...), oui."
            },
            {
              q: "C'est un abonnement ?",
              a: "Non. Paiement unique de 47€, accès à vie, mises à jour incluses."
            }
          ].map((item, i) => (
            <div key={i} style={{
              padding: '24px 0',
              borderBottom: '1px solid #E5E5E5'
            }}>
              <h3 style={{ fontSize: '18px', marginBottom: '12px', fontFamily: 'DM Sans', fontWeight: 600 }}>
                {item.q}
              </h3>
              <p style={{ color: '#6B6B6B' }}>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION CTA FINAL */}
      <section className="section-padding" style={{ background: '#0A0A0A', color: 'white', textAlign: 'center' }}>
        <div ref={addToRefs} className="animate-section" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', marginBottom: '24px', color: 'white' }}>
            Prêt à transformer ton savoir-faire en revenus ?
          </h2>
          <p style={{ color: '#AAAAAA', marginBottom: '40px', fontSize: '18px' }}>
            Rejoins les centaines de créateurs qui ont lancé leur business grâce à NOAH™.
          </p>
          <button className="btn-primary" style={{ background: '#4A7C59' }}>
            Commencer maintenant — 47€ <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: '40px 20px',
        textAlign: 'center',
        borderTop: '1px solid #E5E5E5'
      }}>
        <p style={{ color: '#6B6B6B', fontSize: '14px' }}>
          © 2026 NOAH™ — Tous droits réservés
        </p>
        <p style={{ color: '#AAAAAA', fontSize: '12px', marginTop: '8px' }}>
          Contact : support@noah.ai · Mentions légales · CGV
        </p>
      </footer>
    </div>
  );
}