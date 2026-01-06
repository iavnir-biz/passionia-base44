import React from 'react';
import { motion } from 'framer-motion';
import { Video, Target, Users, Package, FileText, Send, Mail, Share2, TrendingUp } from 'lucide-react';
import VideoGuideCard from './VideoGuideCard';

const VIDEO_GUIDES = [
  {
    id: 'market-analysis',
    title: 'Analyse de marché',
    description: 'Comprendre ton marché et valider la demande pour ton offre',
    duration: '3 min',
    icon: TrendingUp,
    color: 'bg-blue-500',
    videoUrl: '', // À remplir avec l'URL YouTube ou autre
    thumbnail: ''
  },
  {
    id: 'avatar-client',
    title: 'Avatar client',
    description: 'Définir précisément qui sont tes clients idéaux',
    duration: '4 min',
    icon: Users,
    color: 'bg-purple-500',
    videoUrl: '',
    thumbnail: ''
  },
  {
    id: 'mes-offres',
    title: 'Créer mes offres',
    description: 'Construire ta gamme de produits et définir tes prix',
    duration: '5 min',
    icon: Package,
    color: 'bg-green-500',
    videoUrl: '',
    thumbnail: ''
  },
  {
    id: 'page-vente',
    title: 'Page de vente',
    description: 'Rédiger une page qui convertit tes visiteurs en clients',
    duration: '6 min',
    icon: FileText,
    color: 'bg-orange-500',
    videoUrl: '',
    thumbnail: ''
  },
  {
    id: 'messages-vente',
    title: 'Messages de vente',
    description: 'Approcher tes prospects avec les bons messages',
    duration: '4 min',
    icon: Send,
    color: 'bg-pink-500',
    videoUrl: '',
    thumbnail: ''
  },
  {
    id: 'emails-marketing',
    title: 'Emails marketing',
    description: 'Automatiser ton nurturing avec des séquences emails',
    duration: '5 min',
    icon: Mail,
    color: 'bg-indigo-500',
    videoUrl: '',
    thumbnail: ''
  },
  {
    id: 'reseaux-sociaux',
    title: 'Réseaux sociaux',
    description: 'Créer du contenu engageant pour attirer ton audience',
    duration: '4 min',
    icon: Share2,
    color: 'bg-cyan-500',
    videoUrl: '',
    thumbnail: ''
  },
  {
    id: 'plan-action',
    title: 'Suivre mon plan',
    description: 'Utiliser efficacement le plan d\'action 7 jours',
    duration: '3 min',
    icon: Target,
    color: 'bg-red-500',
    videoUrl: '',
    thumbnail: ''
  }
];

export default function VideoGuidesSection() {
  return (
    <div className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Guides Vidéo</h2>
        </div>
        <p className="text-gray-600 text-lg">
          Découvre comment utiliser chaque fonctionnalité pour réussir ta première vente
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {VIDEO_GUIDES.map((guide, index) => (
          <motion.div
            key={guide.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <VideoGuideCard guide={guide} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}