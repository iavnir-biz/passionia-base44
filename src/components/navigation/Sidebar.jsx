import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
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
  Package
} from "lucide-react";
import ProgressBar from '@/components/ui/ProgressBar';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
  { name: 'Plan d\'action', icon: Target, page: 'PlanAction' },
  { name: 'Actions du jour', icon: Calendar, page: 'DailyActions' },
  { name: 'Messages de vente', icon: MessageCircle, page: 'SalesMessages' },
  { name: 'Emails Marketing', icon: Send, page: 'EmailsMarketing' },
  { name: 'Page de vente', icon: FileText, page: 'SalesPage' },
  { name: 'Offres', icon: Package, page: 'MyOffers' },
  { name: 'Avatars clients', icon: User, page: 'AvatarClients' },
  { name: 'Publicité ADS', icon: Magnet, page: 'AdCopies', locked: true },
  { name: 'Réseaux sociaux', icon: Share2, page: 'SocialMedia', locked: true },
  { name: 'Discuter avec Nova', icon: MessageCircle, page: 'NovaChat', locked: true },
  { name: 'Documents IA', icon: FileText, page: 'Documents' },
  { name: 'Paramètres', icon: Settings, page: 'Settings' },
];

export default function Sidebar({ currentPage, progress = 0 }) {
  return (
    <aside className="w-72 h-screen bg-[#11112b] border-r border-[#2a2a45] flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-[#2a2a45]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#11112b]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">PASSION IA</h1>
            <p className="text-xs text-gray-400">Générateur d'activité</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="p-6 border-b border-[#2a2a45]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Progression globale</span>
          <span className="text-sm font-semibold text-[#61f7a2]">{progress}%</span>
        </div>
        <ProgressBar value={progress} max={100} size="sm" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = currentPage === item.page;
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-gradient-active text-[#61f7a2] border border-[#61f7a2]/20" 
                  : "text-gray-400 hover:text-white hover:bg-[#1b1b33]"
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

      {/* Logout */}
      <div className="p-4 border-t border-[#2a2a45]">
        <button 
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-[#1b1b33] w-full transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}