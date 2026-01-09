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
  Users
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
  { name: 'Ressources IA', icon: Sparkles, page: 'AIResources' },
  { name: 'Discuter avec nous', icon: MessageCircle, page: 'NovaChat', locked: true },
];

export default function Sidebar({ currentPage, progress = 0, user }) {
  const calculateDay = (prog) => {
    if (prog === 0) return 1;
    if (prog < 30) return 1;
    if (prog < 60) return 2;
    if (prog < 100) return 3;
    return 4;
  };

  return (
    <aside className="w-72 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">PASSION IA</h1>
        </div>
      </div>

      {/* User Profile - Nouveau bloc */}
      <div className="p-6 border-b border-gray-200">
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
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-5 mb-4">
          <h3 className="text-white font-bold text-base mb-2 flex items-center gap-2">
            ✨ Besoin d'aide ?
          </h3>
          <p className="text-purple-100 text-xs mb-4">
            Un expert peut t'aider à avancer plus vite.
          </p>
          <Link
            to={createPageUrl('Booking')}
            className="flex items-center justify-center gap-2 w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-2.5 px-4 rounded-xl transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Prendre rendez-vous</span>
          </Link>
        </div>

        <div className="bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl p-5 mb-4">
          <h3 className="text-white font-bold text-base mb-2 flex items-center gap-2">
            ✨ Accéder à la communauté
          </h3>
          <p className="text-amber-50 text-xs mb-4">
            Partage avec d'autres adhérents, reçois du soutien.
          </p>
          <a
            href="https://www.skool.com/ia-pour-tous-6043/about?ref=8a2dca11af9048e6940087b263136daa"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-2.5 px-4 rounded-xl transition-all"
          >
            <Users className="w-4 h-4" />
            <span className="text-sm">Accéder à Skool</span>
          </a>
        </div>

        <Link
          to={createPageUrl('Settings')}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-1",
            currentPage === 'Settings'
              ? "bg-[#61f7a2]/10 text-[#61f7a2] border border-[#61f7a2]/20"
              : "text-gray-600 hover:text-gray-900 hover:bg-blue-900/10"
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Paramètres</span>
        </Link>
        <button 
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:text-red-500 hover:bg-blue-900/10 w-full transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}