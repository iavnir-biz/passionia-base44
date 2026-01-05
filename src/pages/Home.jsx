import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Music, Code, Globe, Dumbbell, UtensilsCrossed, Camera, 
  ArrowRight, Sparkles, Guitar, Heart, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
  { icon: Music, label: 'Musique', color: 'bg-pink-50 text-pink-600 border-pink-200' },
  { icon: Code, label: 'Code', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { icon: Globe, label: 'Langues', color: 'bg-green-50 text-green-600 border-green-200' },
  { icon: Dumbbell, label: 'Sport', color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { icon: UtensilsCrossed, label: 'Cuisine', color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
  { icon: Camera, label: 'Photo', color: 'bg-purple-50 text-purple-600 border-purple-200' },
];

const projectionExamples = [
  { icon: '🎸', skill: 'Guitare', product: 'Communauté en ligne' },
  { icon: '🧘', skill: 'Yoga', product: 'Formation en ligne' },
  { icon: '💪', skill: 'Calisthénie', product: 'Coaching 1:1' },
];

export default function Home() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  const handleStart = () => {
    navigate(createPageUrl('OnboardingFirstName'));
  };

  const handleCategoryClick = (category) => {
    setSearchValue(category);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">PASSION IA</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              className="text-gray-600 hover:text-gray-900"
            >
              Connexion
            </Button>
            <Button 
              onClick={handleStart}
              className="bg-[#61f7a2] hover:bg-[#4de88f] text-gray-900 font-semibold"
            >
              Démarrer
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              {/* Social Proof Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-50 to-green-50 border border-purple-100 mb-8"
              >
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-700">
                  <strong>+697</strong> personnes ont vérifié si leur passion pouvait devenir une activité ce mois-ci
                </span>
              </motion.div>

              {/* Main Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
              >
                Et si entreprendre en ligne n'avait jamais été aussi{' '}
                <span className="text-[#61f7a2]">simple</span> ?
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-600 mb-10 leading-relaxed"
              >
                Découvre comment transformer ce que tu sais déjà en une activité en ligne, guidé pas à pas par l'IA.
              </motion.p>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-50 rounded-2xl p-2 shadow-lg border border-gray-200 mb-6"
              >
                <div className="flex gap-2">
                  <Input
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Quelle compétence veux-tu transmettre ?"
                    className="flex-1 border-0 bg-white text-lg h-14 focus-visible:ring-0"
                  />
                  <Button
                    onClick={handleStart}
                    size="lg"
                    className="bg-[#61f7a2] hover:bg-[#4de88f] text-gray-900 font-semibold px-8 h-14"
                  >
                    Démarrer
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </motion.div>

              {/* Category Tags */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-3"
              >
                {categories.map((category, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCategoryClick(category.label)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${category.color} transition-all hover:scale-105 hover:shadow-md`}
                  >
                    <category.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{category.label}</span>
                  </button>
                ))}
              </motion.div>
            </div>

            {/* Right Visual */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-gray-50 to-green-50 rounded-3xl p-8 border border-gray-200 shadow-2xl">
                {/* Map Illustration */}
                <div className="relative h-80 mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-green-100 rounded-2xl opacity-30" />
                  
                  {/* Animated Pins */}
                  {[1, 2, 3, 4, 5].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7 + idx * 0.1 }}
                      className="absolute"
                      style={{
                        top: `${Math.random() * 70 + 10}%`,
                        left: `${Math.random() * 70 + 10}%`,
                      }}
                    >
                      <div className="w-10 h-10 bg-[#61f7a2] rounded-full flex items-center justify-center shadow-lg">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Projection Examples */}
                <div className="space-y-3">
                  {projectionExamples.map((example, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + idx * 0.1 }}
                      className="bg-white rounded-xl p-4 shadow-md border border-gray-100 flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-50 to-green-50 flex items-center justify-center text-2xl">
                        {example.icon}
                      </div>
                      <div className="flex items-center gap-3 flex-1">
                        <span className="font-medium text-gray-900">{example.skill}</span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{example.product}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold shadow-lg"
              >
                🎉 Match trouvé !
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}