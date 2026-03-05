import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, MessageCircle, LogOut, User,
  Users, ChevronDown, ExternalLink, Headphones,
  Package, Target
} from 'lucide-react';

export default function NoahSidebar({ currentPage, user, isOpen, onClose }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      if (profiles.length > 0) setProfile(profiles[0]);
    } catch (e) { console.error(e); }
  };

  const displayName = profile?.first_name || user?.firstName || user?.full_name?.split(' ')[0] || '';
  const avatarUrl = profile?.avatar_url || user?.profile_picture;

  const navItems = [
    { label: 'Overview', page: 'DashboardNoah', icon: LayoutDashboard },
    { label: 'Mes offres', page: 'MesOffresNoah', icon: Package },
    { label: 'Mes messages de vente', page: 'MesMessagesNoah', icon: MessageCircle },
    { label: 'Mon plan d\'action', page: 'MonPlanNoah', icon: Target },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />}

      <aside className={cn(
        "w-64 h-screen bg-white border-r border-[#e5e5e5] flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )} style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>

        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-[#e5e5e5]">
          <div className="flex items-center gap-2.5">
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontSize: '14px', color: '#fff', fontWeight: 700 }}>N</span>
            </div>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.02em' }}>
              iAvenir Lab
            </span>
          </div>
          <button onClick={onClose} className="ml-auto p-1.5 rounded-lg hover:bg-[#f5f5f5] lg:hidden">
            <ChevronDown className="w-4 h-4 text-[#888] rotate-90" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-[#1a1a1a] text-white"
                    : "text-[#666] hover:bg-[#f5f5f5] hover:text-[#1a1a1a]"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-[#e5e5e5] px-3 py-3 space-y-1">
          {/* Contacter le support */}
          <a
            href="mailto:support@iavenir.com"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#666] hover:bg-[#f5f5f5] hover:text-[#1a1a1a] transition-all"
          >
            <Headphones className="w-4 h-4" />
            Contacter le support
          </a>

          {/* Rejoindre le School */}
          <a
            href="https://www.skool.com/ia-pour-tous-6043/about?ref=8a2dca11af9048e6940087b263136daa"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#666] hover:bg-[#f5f5f5] hover:text-[#1a1a1a] transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Rejoindre le School
          </a>
        </div>

        {/* User block */}
        <div className="border-t border-[#e5e5e5] px-3 py-3">
          <div className="flex items-center gap-3 px-2">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover border border-[#e5e5e5]" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#f0f0f0] flex items-center justify-center">
                <User className="w-4 h-4 text-[#888]" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1a1a1a] truncate">{displayName}</p>
              <div style={{
                display: 'inline-flex', fontSize: '10px', fontWeight: 600,
                padding: '1px 8px', borderRadius: '100px', background: '#f5f5f5',
                border: '1px solid #e5e5e5', color: '#888'
              }}>
                Starter
              </div>
            </div>
            <button
              onClick={() => base44.auth.logout()}
              className="p-1.5 rounded-lg hover:bg-[#f5f5f5] text-[#ccc] hover:text-[#888] transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}