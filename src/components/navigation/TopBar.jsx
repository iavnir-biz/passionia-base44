import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import {
  Bell, User, Search, Settings, LogOut, ChevronDown, Menu,
  Target, Users, Package, MessageCircle, Send, FileText,
  LayoutDashboard, Sparkles, CheckCircle, Loader2, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

const searchablePages = [
  { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard', keywords: 'accueil home tableau de bord' },
  { name: 'Plan d\'action', icon: Target, page: 'PlanAction', keywords: 'plan 7 jours missions objectifs' },
  { name: 'Analyse SWOT', icon: Target, page: 'MarketAnalysis', keywords: 'marche concurrence swot analyse' },
  { name: 'Avatars clients', icon: Users, page: 'AvatarClients', keywords: 'clients avatars personas cible audience' },
  { name: 'Mes offres', icon: Package, page: 'MyOffers', keywords: 'offres produits prix low ticket' },
  { name: 'Messages de vente', icon: MessageCircle, page: 'SalesMessages', keywords: 'messages dm vente prospection' },
  { name: 'Emails marketing', icon: Send, page: 'EmailsMarketing', keywords: 'emails marketing sequence' },
  { name: 'Page de vente', icon: FileText, page: 'SalesPage', keywords: 'page vente landing' },
  { name: 'Parametres', icon: Settings, page: 'Settings', keywords: 'parametres compte profil' },
];

export default function TopBar({ user, onMenuClick, session }) {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [profile, setProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadProfile = async () => {
    try {
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const displayName = profile?.first_name || user?.firstName || user?.full_name?.split(' ')[0] || 'Createur';
  const fullDisplayName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : user?.full_name || displayName;
  const avatarUrl = profile?.avatar_url || user?.profile_picture;

  // Search filtering
  const filteredPages = searchQuery.trim().length > 0
    ? searchablePages.filter(p => {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.keywords.toLowerCase().includes(q);
      })
    : [];

  const handleSearchSelect = (page) => {
    navigate(createPageUrl(page));
    setSearchQuery('');
    setShowSearch(false);
  };

  // Notifications
  const notifications = [];

  if (session?.generation_in_progress) {
    notifications.push({
      id: 'gen_progress',
      icon: Loader2,
      iconClass: 'text-blue-600 animate-spin',
      title: 'Generation en cours',
      desc: 'Noah genere tes documents...',
      time: 'Maintenant',
      isNew: true
    });
  }

  const assetsCount = [
    session?.complete_market_analysis,
    session?.generated_avatars,
    session?.my_generated_offers || session?.detailed_offers,
    session?.generated_sales_messages,
    session?.generated_marketing_emails,
    session?.generated_sales_pages
  ].filter(Boolean).length;

  if (assetsCount > 0 && assetsCount < 6) {
    notifications.push({
      id: 'assets_partial',
      icon: Sparkles,
      iconClass: 'text-[#61f7a2]',
      title: `${assetsCount}/6 documents generes`,
      desc: 'Continue ton parcours pour debloquer les suivants',
      time: '',
      isNew: false
    });
  }

  if (assetsCount === 6) {
    notifications.push({
      id: 'assets_complete',
      icon: CheckCircle,
      iconClass: 'text-green-500',
      title: 'Tous tes documents sont prets !',
      desc: 'Accede-les depuis ton dashboard',
      time: '',
      isNew: false
    });
  }

  if (session?.plan_progress) {
    const completedDays = Object.entries(session.plan_progress)
      .filter(([_, v]) => v?.completed).length;
    if (completedDays > 0 && completedDays < 7) {
      notifications.push({
        id: 'plan_progress',
        icon: Calendar,
        iconClass: 'text-purple-500',
        title: `${completedDays}/7 jours completes`,
        desc: 'Continue ton plan d\'action',
        time: '',
        isNew: false
      });
    }
  }

  if (notifications.length === 0) {
    notifications.push({
      id: 'welcome',
      icon: Sparkles,
      iconClass: 'text-gray-400',
      title: 'Bienvenue !',
      desc: 'Tes notifications apparaitront ici',
      time: '',
      isNew: false
    });
  }

  const hasNewNotif = notifications.some(n => n.isNew);

  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl flex items-center gap-4" ref={searchRef}>
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une page..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(true); }}
            onFocus={() => setShowSearch(true)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-[#61f7a2] focus:ring-1 focus:ring-[#61f7a2] transition-all"
          />

          {/* Search results dropdown */}
          {showSearch && searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 max-h-80 overflow-y-auto">
              {filteredPages.length > 0 ? (
                filteredPages.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.page}
                      onClick={() => handleSearchSelect(p.page)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{p.name}</span>
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  Aucun resultat pour "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 ml-6">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
            className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all relative"
          >
            <Bell className="w-5 h-5" />
            {hasNewNotif && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">Notifications</p>
                </div>
                {notifications.map((notif) => {
                  const Icon = notif.icon;
                  return (
                    <div key={notif.id} className={`px-4 py-3 flex items-start gap-3 ${notif.isNew ? 'bg-blue-50/50' : ''}`}>
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className={`w-4 h-4 ${notif.iconClass}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{notif.desc}</p>
                      </div>
                      {notif.time && (
                        <span className="text-xs text-gray-400 flex-shrink-0">{notif.time}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* User Avatar with Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-9 h-9 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
            <ChevronDown className={cn(
              "w-4 h-4 text-gray-600 transition-transform",
              showUserMenu && "rotate-180"
            )} />
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{fullDisplayName}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{user?.email || ''}</p>
                </div>

                {/* Menu Items */}
                <button
                  onClick={() => {
                    navigate(createPageUrl('Settings'));
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left border-t border-gray-100 mt-1"
                >
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Parametres</span>
                </button>

                <button
                  onClick={() => {
                    base44.auth.logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-600">Deconnexion</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
