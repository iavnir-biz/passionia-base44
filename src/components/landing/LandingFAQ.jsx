import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus } from 'lucide-react';

function FAQItem({ number, question, answer, isOpen, onToggle }) {
  return (
    <div style={{ borderBottom: '1px solid #e5e5e5' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: 'none',
          border: 'none',
          padding: '22px 0',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'inherit'
        }}
      >
        <span style={{
          fontSize: '13px',
          fontWeight: 600,
          color: isOpen ? '#1a1a1a' : '#bbb',
          background: isOpen ? '#1a1a1a' : 'transparent',
          color: isOpen ? '#fff' : '#bbb',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.3s ease',
          border: isOpen ? 'none' : '1px solid #ddd',
        }}>{number}</span>
        <span style={{
          fontSize: '16px',
          fontWeight: 500,
          color: '#1a1a1a',
          flex: 1,
        }}>{question}</span>
        <div style={{
          flexShrink: 0,
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {isOpen ? (
            <Minus size={18} color="#1a1a1a" strokeWidth={2} />
          ) : (
            <Plus size={18} color="#999" strokeWidth={2} />
          )}
        </div>
      </button>
      <div style={{
        maxHeight: isOpen ? '500px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.4s ease',
      }}>
        <p style={{
          fontSize: '15px',
          color: '#666',
          lineHeight: 1.7,
          paddingBottom: '24px',
          paddingLeft: '44px',
          margin: 0,
        }}>
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function LandingFAQ() {
  const ref = useRef(null);
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) e.target.classList.add('visible'); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const faqs = [
    { q: "Est-ce que c'est vraiment pour moi ?", a: "Oui, si tu as un savoir-faire, une expertise ou un vécu qui peut aider quelqu'un à progresser. Pas besoin d'être \"expert international\". Il suffit d'avoir un coup d'avance sur quelqu'un. Si tu peux aider une personne, tu peux vendre." },
    { q: "Est-ce que je dois déjà avoir un produit ?", a: "Non. Justement, NOAH™ t'aide à : • Trouver quoi vendre • Structurer tes 4 offres • Définir les prix • Comprendre la logique d'ascension. Tu n'as rien à préparer avant." },
    { q: "Est-ce que je dois être à l'aise en vente ou en marketing ?", a: "Non. Tu n'as pas besoin : • De webinaire • D'appel de vente • De tunnel compliqué • De connaissances techniques avancées. NOAH™ te guide étape par étape." },
    { q: "En quoi c'est différent d'une formation en ligne classique ?", a: "Les formations te donnent des concepts. Noah te donne des résultats. Pas de module à regarder pendant 40h. Pas de template à remplir. Tu entres ton idée, tu ressors avec une offre prête à vendre. C'est un générateur, pas un cours." },
    { q: "Est-ce que c'est automatique ?", a: "NOAH™ génère la structure et les offres pour toi. Mais c'est toi qui passes à l'action. L'objectif n'est pas la magie. C'est la clarté + l'exécution." },
    { q: "En combien de temps puis-je faire ma première vente ?", a: "Si tu passes à l'action immédiatement, tu peux : • Savoir quoi vendre en 15 minutes • Envoyer tes premiers messages le jour même • Déclencher une première vente en 24h. Tout dépend de ton implication." },
    { q: "Est-ce que ça fonctionne dans toutes les niches ?", a: "Oui, tant que ton savoir-faire peut aider quelqu'un. Exemples : Coach sportif, Maman solo qui aide à gérer un budget, Prof de jiu-jitsu, Hypnothérapeute, Passionné de cuisine vegan, Entrepreneur débordé, Coach spirituel, Expert rénovation, Prof de chant, etc. Le principe reste le même : Une transformation = une offre." },
    { q: "Et si je ne suis pas satisfait ?", a: "Tu bénéficies d'une garantie 30 jours. Si tu n'es pas satisfait, tu es remboursé. Simple." },
    { q: "Est-ce que je dois investir en publicité ?", a: "Non. Mais tu pourras plus tard. Tu peux commencer sans pub. L'objectif est d'abord : • Structurer • Vendre • Valider. La pub vient ensuite si tu veux scaler." },
    { q: "Est-ce que c'est une formation avec des dizaines d'heures de vidéos ?", a: "Non. C'est un système simple et direct. L'objectif est d'aller droit au résultat, pas de te faire regarder 40h de contenu." },
  ];

  return (
    <section ref={ref} className="landing-fade" style={{
      padding: '100px 24px',
      background: '#f5f5f5'
    }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: 400,
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
          textAlign: 'center',
          marginBottom: '56px',
        }}>
          Questions <span style={{ fontStyle: 'italic', fontWeight: 700 }}>fréquentes</span>
        </h2>

        {faqs.map((f, i) => (
          <FAQItem
            key={i}
            number={i + 1}
            question={f.q}
            answer={f.a}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
          />
        ))}
      </div>
    </section>
  );
}