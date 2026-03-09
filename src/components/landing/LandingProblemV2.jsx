import React, { useEffect, useRef } from 'react';

export default function LandingProblemV2() {
  const ref = useRef(null);
  const narrativeRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) e.target.classList.add('visible'); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    if (narrativeRef.current) obs.observe(narrativeRef.current);
    return () => obs.disconnect();
  }, []);

  const problems = [
    "Tu ne sais pas quel prix fixer",
    "Tu ne sais pas à qui vendre",
    "Tu ne sais pas par où commencer",
    "Tu as peur de ne pas être légitime",
    "Tu manques de temps pour tout créer",
    "Tu te perds dans la technique"
  ];

  return (
    <section ref={ref} className="landing-fade" style={{
      padding: '80px 24px',
      maxWidth: '900px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <p style={{
        fontSize: '13px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        color: '#999',
        marginBottom: '16px'
      }}>Le problème</p>

      <h2 style={{
        fontSize: 'clamp(28px, 4vw, 44px)',
        fontWeight: 400,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
        marginBottom: '48px'
      }}>
        Tu as un talent. Mais <span style={{ fontStyle: 'italic' }}>tu ne sais pas</span> comment le vendre.
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        textAlign: 'left'
      }}>
        {problems.map((p, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '20px 24px',
            background: '#fafafa',
            borderRadius: '16px',
            border: '1px solid #f0f0f0'
          }}>
            <span style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#fee',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              flexShrink: 0
            }}>✕</span>
            <span style={{ fontSize: '15px', color: '#555' }}>{p}</span>
          </div>
        ))}
      </div>

      {/* Narrative block */}
      <div ref={narrativeRef} className="landing-fade" style={{
        marginTop: '64px',
        padding: '48px 32px',
        maxWidth: '700px',
        margin: '64px auto 0',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: 'clamp(16px, 2.2vw, 20px)',
          fontWeight: 400,
          color: '#555',
          lineHeight: 1.8,
          letterSpacing: '-0.01em',
          marginBottom: '0',
        }}>
          <span style={{
            display: 'block',
            fontSize: 'clamp(22px, 3vw, 30px)',
            fontWeight: 600,
            color: '#1a1a1a',
            letterSpacing: '-0.02em',
            marginBottom: '24px',
          }}>
            Le vrai problème, ce n'est pas toi.
          </span>
          C'est que personne ne t'a donné la structure.<br />
          Tu sais aider les gens — mais transformer ça en offre rentable ?<br />
          Fixer un prix sans te brader ? Trouver tes premiers clients ?<br />
          <br />
          Tu as cherché partout. Formations, vidéos YouTube, posts LinkedIn.<br />
          Résultat : tu sais tout en théorie. Mais tu n'as toujours rien lancé.
        </p>

        <p style={{
          marginTop: '32px',
          fontSize: 'clamp(18px, 2.5vw, 24px)',
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: '#1a1a1a',
          background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          display: 'inline-block',
          paddingRight: '0.3em',
          marginRight: '-0.3em',
          paddingBottom: '0.1em',
          marginBottom: '-0.1em',
        }}>
          C'est exactement pour ça qu'on a créé Noah.
        </p>
      </div>
    </section>
  );
}
