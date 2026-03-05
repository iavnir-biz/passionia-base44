import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Play, Package, MessageCircle, Users } from 'lucide-react';

const CARDS = [
  {
    title: 'PLAN D\'ACTION',
    subtitle: 'Formation & Plan d\'action',
    desc: 'Un programme conçu pour t\'aider à créer, lancer et vendre tes premiers produits en 7 jours.',
    cta: 'Découvrir le plan',
    page: 'PlanAction',
    icon: Play,
    gradient: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
  },
  {
    title: 'PRODUITS',
    subtitle: 'Générer vos produits',
    desc: 'Détaille et personnalise tes 4 offres avec l\'intelligence de Noah.',
    cta: 'Accéder aux produits',
    page: 'MyOffers',
    icon: Package,
    gradient: 'linear-gradient(135deg, #333 0%, #555 100%)',
  },
  {
    title: 'MESSAGES',
    subtitle: 'Générer vos messages de vente',
    desc: 'Crée des messages percutants pour toucher tes futurs clients.',
    cta: 'Générer les messages',
    page: 'SalesMessages',
    icon: MessageCircle,
    gradient: 'linear-gradient(135deg, #444 0%, #666 100%)',
  },
  {
    title: 'COMMUNAUTÉ',
    subtitle: 'Rejoindre la communauté',
    desc: 'Un espace d\'entraide, de partage et de connexion avec des créateurs comme toi.',
    cta: 'Rejoindre la communauté',
    page: null,
    href: 'https://www.skool.com/ia-pour-tous-6043/about?ref=8a2dca11af9048e6940087b263136daa',
    icon: Users,
    gradient: 'linear-gradient(135deg, #555 0%, #777 100%)',
  },
];

export default function NoahExploreCards() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px' }}>
        Explorer l'écosystème
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
        {CARDS.map((card, idx) => {
          const Icon = card.icon;
          const handleClick = () => {
            if (card.href) {
              window.open(card.href, '_blank');
            } else if (card.page) {
              navigate(createPageUrl(card.page));
            }
          };

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.08 }}
              style={{
                borderRadius: '16px', overflow: 'hidden',
                border: '1px solid #e5e5e5', background: '#fff',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
              className="hover:shadow-md hover:border-[#ccc]"
              onClick={handleClick}
            >
              {/* Color bar */}
              <div style={{
                height: '80px', background: card.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative'
              }}>
                <span style={{
                  fontSize: '14px', fontWeight: 800, color: 'rgba(255,255,255,0.3)',
                  letterSpacing: '0.1em', textTransform: 'uppercase'
                }}>
                  {card.title}
                </span>
              </div>

              <div style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Icon style={{ width: '14px', height: '14px', color: '#1a1a1a' }} />
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>{card.subtitle}</p>
                </div>
                <p style={{ fontSize: '12px', color: '#888', lineHeight: 1.5, marginBottom: '14px' }}>
                  {card.desc}
                </p>
                <button
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '6px', padding: '10px', borderRadius: '10px',
                    border: '1px solid #e5e5e5', background: '#fff',
                    fontSize: '12px', fontWeight: 600, color: '#1a1a1a',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  className="hover:bg-[#f5f5f5]"
                >
                  {card.cta} <ArrowRight size={12} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}