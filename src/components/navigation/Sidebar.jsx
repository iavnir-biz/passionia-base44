import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Target,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
  MessageCircle,
  Lock,
  Send,
  User,
  Magnet,
  Share2,
  Package,
  ChevronDown,
  BarChart3,
  Users,
  Clock,
  Zap,
  BookOpen
} from "lucide-react";
import ProgressBar from '@/components/ui/ProgressBar';

function UserProfileBlock({ user, progress, calculateDay }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayName = profile?.first_name || user?.firstName || user?.full_name?.split(' ')[0] || 'Créateur';
  const avatarUrl = profile?.avatar_url || user?.profile_picture;

  return (
    <div className="flex items-center gap-3 mb-3">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
      )}
      <div className="flex-1">
        <p className="font-bold text-gray-900">{displayName}</p>
        <p className="text-xs text-gray-600">Jour {calculateDay(progress)}</p>
      </div>
    </div>
  );
}

const menuStructure = [
  { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
  { name: 'Plan d\'action', icon: Target, page: 'PlanAction' },
  { name: 'Mon journal', icon: BookOpen, page: 'Journal' },
  { name: 'Ressources IA', icon: Sparkles, page: 'AIResources' },
  { name: 'Discuter avec Noah', icon: MessageCircle, page: 'NovaChat', locked: true },
];

export default function Sidebar({ currentPage, progress = 0, user, isOpen, onClose }) {
  const [timeLeftCoaching, setTimeLeftCoaching] = useState(0);

  const calculateDay = (prog) => {
    if (prog === 0) return 1;
    if (prog < 30) return 1;
    if (prog < 60) return 2;
    if (prog < 100) return 3;
    return 4;
  };

  // ⏰ Countdown 72h pour coaching (démarre depuis l'achat du pack)
  useEffect(() => {
    if (!user?.has_purchased || !user?.purchased_at) return;
    if (user?.has_purchased_upsell || user?.has_purchased_downsell || user?.has_coaching) return;

    const calculateTimeLeft = () => {
      const purchasedAt = new Date(user.purchased_at).getTime();
      const now = Date.now();
      const deadline = purchasedAt + (72 * 60 * 60 * 1000); // 72h en millisecondes
      const remaining = Math.max(0, deadline - now);
      return Math.floor(remaining / 1000); // en secondes
    };

    setTimeLeftCoaching(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeftCoaching(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [user]);

  const formatTimeCoaching = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const shouldShowCoachingOffer = () => {
    return user?.has_purchased
      && !user?.has_purchased_upsell
      && !user?.has_purchased_downsell
      && !user?.has_coaching
      && timeLeftCoaching > 0;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "w-72 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 lg:translate-x-0 shadow-xl lg:shadow-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center shadow-sm">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <ChevronDown className="w-5 h-5 text-gray-500 rotate-90" />
          </button>
        </div>

        {/* User Profile - Nouveau bloc */}
        <div className="p-4 border-b border-gray-200">
          <UserProfileBlock user={user} progress={progress} calculateDay={calculateDay} />
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Progression</span>
              <span className="text-xs font-semibold text-purple-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-1.5 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuStructure.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => onClose && onClose()}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-[#61f7a2]/10 text-[#61f7a2] border border-[#61f7a2]/20"
                    : "text-gray-600 hover:text-gray-900 hover:bg-blue-900/10"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1 font-medium">{item.name}</span>
                {item.locked && <Lock className="w-3.5 h-3.5 text-gray-500" />}
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Link>
            );
          })}
        </nav>

        {/* Bloc Besoin d'aide - Premium */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl p-3 mb-2 shadow-sm">
            <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
              ✨ Besoin d'aide ?
            </h3>
            <Link
              to={createPageUrl('Booking')}
              className="flex items-center justify-center gap-2 w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-3 rounded-lg transition-all backdrop-blur-sm border border-white/10"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Prendre RDV</span>
            </Link>
          </div>

          <div className="bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl p-3 mb-2 shadow-sm">
            <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
              ✨ Communauté
            </h3>
            <a
              href="https://www.skool.com/ia-pour-tous-6043/about?ref=8a2dca11af9048e6940087b263136daa"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-3 rounded-lg transition-all backdrop-blur-sm border border-white/10"
            >
              <Users className="w-4 h-4" />
              <span className="text-xs">Accéder à Skool</span>
            </a>
          </div>

        </div>
      </aside>
    </>
  );
}