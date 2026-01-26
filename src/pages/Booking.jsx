import React, { useState, useEffect } from 'react';
import { useRequireAuth } from '@/components/hooks/useRequireAuth';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import ChatBubble from '@/components/chat/ChatBubble';
import { Calendar, Clock, Video, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Booking() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar
          currentPage="Booking"
          progress={0}
          user={user}
          isOpen={false}
          onClose={() => { }}
        />
        <div className="flex-1 w-full lg:ml-72">
          <div className="flex items-center justify-center h-screen">
            <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        currentPage="Dashboard"
        progress={0}
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 w-full lg:ml-72 transition-all duration-300 relative">
        <TopBar
          user={user}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">

            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8 md:mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#61f7a2]/10 rounded-full mb-4">
                <Video className="w-4 h-4 text-[#61f7a2]" />
                <span className="text-sm text-gray-700 font-medium">Appel de 30 minutes</span>
              </div>

              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
                Réserve ton créneau avec un expert
              </h1>
              <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
                Profite d'un appel personnalisé pour débloquer ton projet et accélérer tes résultats
              </p>
            </motion.div>

            {/* Benefits Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12"
            >
              {[
                {
                  icon: CheckCircle,
                  title: 'Conseils personnalisés',
                  description: 'Des recommandations adaptées à ton projet et ta situation'
                },
                {
                  icon: Clock,
                  title: 'Gagne du temps',
                  description: 'Évite les erreurs courantes et avance plus vite'
                },
                {
                  icon: Video,
                  title: 'Appel en visio',
                  description: 'Confortable et efficace, depuis chez toi'
                }
              ].map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-2xl p-4 md:p-6 border border-gray-200"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#61f7a2]/20 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-[#61f7a2]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
            >
              <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-[#61f7a2]" />
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">
                      Sélectionne ton créneau
                    </h2>
                    <p className="text-sm text-gray-600">
                      Tous les créneaux sont en heure française (CET/CEST)
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 md:p-12 flex items-center justify-center bg-white">
                <a
                  href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ33oiS8leJ0wc_B6b1wK5_n5mAJwsWmtdSZ5Qz0XmT0vSoI3IpkFRedNk8GmBjWXE53uBH8eK_2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-gray-900 transition-all duration-200 bg-[#61f7a2] border border-transparent rounded-xl hover:bg-[#4fe590] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#61f7a2] w-full md:w-auto"
                >
                  Prendre rendez-vous
                </a>
              </div>
            </motion.div>

            {/* Footer Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
                <span className="text-xs md:text-sm text-gray-700 text-left">
                  Tu recevras un email de confirmation avec le lien de visio
                </span>
              </div>
            </motion.div>

          </div>
        </main>
      </div>

      {/* Chat Bubble */}
      <ChatBubble />
    </div>
  );
}