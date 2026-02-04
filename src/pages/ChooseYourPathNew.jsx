import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Rocket,
  Users,
  Crown,
  ArrowRight,
  Star,
  CheckCircle,
  Calendar
} from 'lucide-react';

export default function ChooseYourPathNew() {
    const navigate = useNavigate();

  const paths = [
    {
      id: 1,
      color: 'green',
      icon: Rocket,
      title: 'CHEMIN 1: Vous testez l\'outil',
      subtitle: 'Générateur 67€',
      features: [
        '5 générations',
        'Garantie 30 jours'
      ],
      cta: 'Accéder au Générateur',
      link: 'ProtocoleQuickwin',
      bgGradient: 'from-green-500 to-emerald-600',
      borderColor: 'border-green-500',
      bgLight: 'bg-green-50'
    },
    {
      id: 2,
      color: 'blue',
      icon: Users,
      title: 'CHEMIN 2: Vous construisez avec nous',
      subtitle: 'Skool 37€/mois',
      features: [
        'Générateur illimité',
        'Accompagnement complet'
      ],
      cta: 'Rejoindre Skool',
      link: 'SkoolAbonnement',
      bgGradient: 'from-blue-500 to-indigo-600',
      borderColor: 'border-blue-500',
      bgLight: 'bg-blue-50'
    },
    {
      id: 3,
      color: 'yellow',
      icon: Crown,
      title: 'CHEMIN 3: On fait tout pour vous',
      subtitle: 'Done For You 4000€',
      features: [
        'Business clé en main en 30 jours',
        'Garantie 2000€ de CA en 60 jours'
      ],
      cta: 'Réserver un appel',
      link: 'Booking',
      bgGradient: 'from-yellow-500 to-amber-600',
      borderColor: 'border-yellow-500',
      bgLight: 'bg-yellow-50',
      isCalendar: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
      {/* Header */}
      <div className="py-3 md:py-6 px-4 md:px-5 border-b border-gray-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center shadow-lg shadow-[#61f7a2]/20">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <span className="font-bold text-white text-sm md:text-base">PASSION IA</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 bg-[#61f7a2] text-gray-900 text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 md:py-1.5 rounded-full">
            <Star className="w-2.5 h-2.5 md:w-3 md:h-3" />
            <span className="hidden sm:inline">PROTOCOLE QUICKWIN</span>
            <span className="sm:hidden">QUICKWIN</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        {/* Titre principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-[#61f7a2]/20 border border-[#61f7a2]/30 px-4 py-2 rounded-full mb-6">
            <Rocket className="w-4 h-4 text-[#61f7a2]" />
            <span className="text-[#61f7a2] font-semibold text-sm">VOTRE DÉCISION CE SOIR</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Choisissez votre chemin
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            3 façons de transformer votre savoir-faire en revenus
          </p>
        </motion.div>

        {/* Les 3 chemins */}
        <div className="space-y-6 mb-12">
          {paths.map((path, index) => {
            const Icon = path.icon;
            return (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
                className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl border-2 ${path.borderColor} overflow-hidden hover:shadow-lg hover:shadow-${path.color}-500/10 transition-all`}
              >
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Icône et titre */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${path.bgGradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-white mb-1">
                          {path.title}
                        </h2>
                        <p className={`text-2xl font-extrabold ${
                          path.color === 'green' ? 'text-green-400' :
                          path.color === 'blue' ? 'text-blue-400' :
                          'text-yellow-400'
                        }`}>
                          {path.subtitle}
                        </p>
                        
                        {/* Features */}
                        <ul className="mt-4 space-y-2">
                          {path.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-300">
                              <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                                path.color === 'green' ? 'text-green-400' :
                                path.color === 'blue' ? 'text-blue-400' :
                                'text-yellow-400'
                              }`} />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => navigate(createPageUrl(path.link))}
                        className={`w-full md:w-auto px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r ${path.bgGradient} hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg`}
                      >
                        {path.isCalendar ? (
                          <Calendar className="w-5 h-5" />
                        ) : (
                          <ArrowRight className="w-5 h-5" />
                        )}
                        {path.cta}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        </div>
        </div>
        );
        }