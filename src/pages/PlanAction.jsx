import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  Loader2, 
  ArrowRight,
  CheckCircle,
  Zap,
  TrendingUp,
  Video,
  FileText,
  Users,
  Gift,
  Shield,
  Clock,
  Sparkles,
  Target,
  Mail,
  Check,
  X
} from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from "@/lib/utils";

const mainSteps = [
  { id: 1, label: "Ton Offre" },
  { id: 2, label: "Bonne nouvelle !" },
  { id: 3, label: "Ta Vie Future" },
  { id: 4, label: "Concrètement ?" },
  { id: 5, label: "Plan d'Action" },
];

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

export default function PlanAction() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setEmail(currentUser.email || '');
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      // Save email to user profile
      await base44.auth.updateMe({ email });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error saving email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccessDashboard = () => {
    navigate(createPageUrl('Results'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#11112b] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin" />
      </div>
    );
  }

  const offer = user?.offer || {};
  const products = [
    { key: 'product_principal', label: 'Produit Principal', data: offer.product_principal, multiplier: 30 },
    { key: 'petit_extra', label: 'Order Bump', data: offer.petit_extra, multiplier: 15 },
    { key: 'offre_superieure', label: 'Upsell', data: offer.offre_superieure, multiplier: 9 },
    { key: 'offre_premium', label: 'Premium', data: offer.offre_premium, multiplier: 1 }
  ];

  const revenues = products.map(p => ({
    ...p,
    price: parsePrice(p.data?.price),
    total: parsePrice(p.data?.price) * p.multiplier
  }));

  const totalMonthly = revenues.reduce((sum, r) => sum + r.total, 0);
  const mainProductPrice = revenues[0].price;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Main Navigation Bar */}
      <div className="bg-white border-b border-gray-200 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center gap-1 md:gap-2 flex-wrap">
            {mainSteps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className={cn(
                  "px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap",
                  step.id === 5 
                    ? "bg-[#61f7a2] text-white shadow-sm" 
                    : step.id < 5
                      ? "text-[#61f7a2]"
                      : "text-gray-400"
                )}>
                  {step.id}. {step.label}
                </div>
                {index < mainSteps.length - 1 && (
                  <div className={cn(
                    "w-4 md:w-8 h-[2px]",
                    step.id < 5 ? "bg-[#61f7a2]" : "bg-gray-200"
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Bloc 1 - Tu as maintenant */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-gray-200 p-6 mb-8 shadow-sm"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-[#61f7a2]" />
              Tu as maintenant :
            </h2>
            <div className="space-y-3 mb-4">
              {products.map((product) => (
                <div key={product.key} className="flex items-center gap-3 text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-[#61f7a2]" />
                  <span><strong className="text-gray-900">{product.label} :</strong> {product.data?.title || '—'} ({product.data?.price || '—'})</span>
                </div>
              ))}
              <div className="flex items-center gap-3 text-gray-600 pt-2 border-t border-gray-200">
                <TrendingUp className="w-5 h-5 text-[#61f7a2]" />
                <span><strong className="text-gray-900">Ta projection de revenus :</strong> {totalMonthly.toLocaleString('fr-FR')} €/mois</span>
              </div>
            </div>
            <p className="text-[#61f7a2] text-sm">
              ✨ Une vision claire de ce que tu peux vendre. C'est déjà un excellent début.
            </p>
          </motion.div>

          {/* Bloc 2 - Titre principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Maintenant, on va mettre tout ça en place ensemble.
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Tu sais <strong className="text-gray-900">QUOI</strong> vendre et à <strong className="text-gray-900">QUEL PRIX</strong>. On va te montrer comment tout mettre en place en 4 semaines.
            </p>
          </motion.div>

          {/* Bloc 3 - Empathie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-gray-200 p-6 mb-8 shadow-sm"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
              On s'est mis à ta place
            </h2>
            <div className="space-y-3 mb-4">
              {[
                "J'ai mon offre, mais comment je fais maintenant ?",
                "Je n'y connais rien en technique…",
                "Je ne sais pas faire du marketing…",
                "J'ai peur de me planter…"
              ].map((phrase, idx) => (
                <div key={idx} className="bg-gray-50 rounded-2xl p-3 text-gray-600 italic border-l-4 border-[#61f7a2]/40">
                  "{phrase}"
                </div>
              ))}
            </div>
            <p className="text-center text-[#61f7a2] font-medium">
              On est passés par là. Et on a créé ce pack pour toi.
            </p>
          </motion.div>

          {/* Bloc 4 - Comparatif */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-2 gap-6 mb-8"
          >
            <div className="bg-white rounded-3xl border border-red-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <X className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-bold text-gray-900">Sans ce pack</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Tu vas galérer des semaines",
                  "Tu ne sauras pas par où commencer",
                  "Tu vas te décourager",
                  "Tu abandonneras probablement"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-600">
                    <X className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl border border-green-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Check className="w-6 h-6 text-[#61f7a2]" />
                <h3 className="text-lg font-bold text-gray-900">Avec ce pack</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Tout est déjà prêt",
                  "Tu as un plan étape par étape",
                  "Tu es guidé(e) en vidéo",
                  "Tu lances cette semaine"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <Check className="w-4 h-4 text-[#61f7a2] mt-1 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Bloc 5 - Le Pack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
              🎁 Voici ce qu'on a préparé pour toi :
            </h2>

            <div className="space-y-6">
              {/* 1. Première Vente */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-[#61f7a2]" />
                  1. Première Vente à 27€ dans les 24h
                </h3>
                <ul className="space-y-2 mb-3">
                  {["Messages générés automatiquement", "Même sans communauté", "Plan exact à suivre"].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-300">
                      <Check className="w-4 h-4 text-[#61f7a2]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-[#61f7a2] text-sm font-medium">
                  Résultat attendu : Ta première rentrée d'argent dans les prochaines 24h.
                </p>
              </div>

              {/* 2. Tout le contenu */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-[#61f7a2]" />
                  2. Tout le contenu déjà créé
                </h3>
                <ul className="space-y-2">
                  {["Textes pour les 4 produits", "Page web déjà prête", "Séquence email déjà rédigée"].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-300">
                      <Check className="w-4 h-4 text-[#61f7a2]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. Protocole 4 semaines */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-[#61f7a2]" />
                  3. Le protocole simple à suivre (4 semaines)
                </h3>
                <div className="space-y-3 mb-4">
                  {[
                    { week: 1, text: "Valider l'offre + premières ventes" },
                    { week: 2, text: "Créer l'order bump + continuer à vendre" },
                    { week: 3, text: "Préparer les offres supérieures + créer communauté" },
                    { week: 4, text: "Lancer les pubs autofinancées + livrer" }
                  ].map((item) => (
                    <div key={item.week} className="flex items-start gap-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-3 border border-blue-100">
                      <div className="w-8 h-8 rounded-lg bg-[#61f7a2] flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-sm font-bold text-white">{item.week}</span>
                      </div>
                      <div>
                        <span className="text-gray-900 font-semibold">Semaine {item.week}</span>
                        <p className="text-gray-600 text-sm">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[#61f7a2] text-sm font-medium text-center">
                  Tu suis le protocole jour après jour, tu avances.
                </p>
              </div>

              {/* 4. Accompagnement vidéo */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Video className="w-6 h-6 text-[#61f7a2]" />
                  4. L'accompagnement vidéo
                </h3>
                <ul className="space-y-2">
                  {[
                    "Comment contacter tes prospects",
                    "Comment créer ton contenu",
                    "Comment mettre en place ta page web",
                    "Comment automatiser"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-300">
                      <Check className="w-4 h-4 text-[#61f7a2]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 5. Communauté Skool */}
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-3xl border border-yellow-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-6 h-6 text-yellow-600" />
                    5. Accès communauté Skool
                  </h3>
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 text-xs font-bold rounded-full uppercase">
                    Bonus
                  </span>
                </div>
                <ul className="space-y-2 mb-3">
                  {["Poses tes questions", "Échanges entre membres", "1 live/semaine", "Jamais seul(e)"].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-600">
                      <Check className="w-4 h-4 text-yellow-600" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-3 text-center justify-center">
                  <span className="text-gray-400 line-through">197€</span>
                  <span className="text-yellow-600 font-bold text-xl">Gratuit à vie</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Offre de lancement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-purple-100 via-pink-50 to-blue-50 rounded-3xl border border-purple-200 p-8 mb-8 text-center shadow-md"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🚀 Offre de lancement
            </h2>
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="text-3xl text-gray-400 line-through">197€</span>
              <span className="text-5xl font-bold text-purple-600">67€</span>
            </div>
            <p className="text-gray-600 mb-6">
              Paiement sécurisé • Garantie 30 jours • Accès immédiat
            </p>
            <GlowButton onClick={() => {}} size="lg" className="px-12">
              Je veux lancer en 24h
              <ArrowRight className="w-5 h-5 ml-2" />
            </GlowButton>
          </motion.div>

          {/* Rentabilité */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-3xl border border-gray-200 p-6 mb-8 text-center shadow-sm"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              💰 Rentabilise ton investissement dès la première vente
            </h3>
            <p className="text-gray-600 mb-4">
              Ton produit principal est à <strong className="text-[#61f7a2]">{mainProductPrice}€</strong>.
              {mainProductPrice > 67 && (
                <> En vendant <strong className="text-white">1 seul produit</strong>, tu as déjà remboursé le pack !</>
              )}
            </p>
            <div className="inline-flex items-center gap-2 bg-[#61f7a2]/10 px-4 py-2 rounded-2xl border border-[#61f7a2]/30">
              <TrendingUp className="w-5 h-5 text-[#61f7a2]" />
              <span className="text-[#61f7a2] font-semibold">ROI immédiat dès la première vente</span>
            </div>
          </motion.div>

          {/* Formulaire */}
          {!isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl border border-green-200 p-8 shadow-sm"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  ✨ Reçois ton plan complet par email
                </h2>
                <p className="text-gray-600">
                  Entre ton email pour recevoir l'accès à ton espace membre
                </p>
              </div>
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ton@email.com"
                    className="flex-1 bg-white border-gray-300 text-gray-900"
                    required
                  />
                  <GlowButton type="submit" disabled={isSubmitting || !email}>
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Je me lance'}
                  </GlowButton>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-[#61f7a2]/20 to-green-50 rounded-3xl border-2 border-[#61f7a2] p-8 text-center shadow-lg"
            >
              <div className="w-16 h-16 bg-[#61f7a2] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                🎉 Ton plan est en route vers ta boîte mail !
              </h2>
              <p className="text-gray-700 mb-6">
                Vérifie ta boîte ({email}) dans quelques instants
              </p>
              <GlowButton onClick={handleAccessDashboard} size="lg">
                Accéder à mon espace membre
                <ArrowRight className="w-5 h-5 ml-2" />
              </GlowButton>
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-gray-200 bg-white mt-12">
        <p className="text-gray-500 text-sm">Copyright Passion IA</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-[#61f7a2] animate-pulse" />
          <span className="text-[#61f7a2] text-xs font-medium">SYSTÈME CONNECTÉ</span>
        </div>
      </footer>
    </div>
  );
}