import React, { useState } from 'react';
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
  Package,
  ChevronDown,
  BarChart3
} from "lucide-react";
import ProgressBar from '@/components/ui/ProgressBar';

const menuStructure = [
  { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
  { name: 'Plan d\'action', icon: Target, page: 'PlanAction' },
  {
    name: 'Ressources IA',
    icon: Sparkles,
    isFolder: true,
    items: [
      { name: 'Analyse de marché', icon: BarChart3, page: 'MarketAnalysis' },
      { name: 'Avatars clients', icon: User, page: 'AvatarClients' },
      { name: 'Offres', icon: Package, page: 'MyOffers' },
      { name: 'Page de vente', icon: FileText, page: 'SalesPage' },
      { name: 'Messages de vente', icon: MessageCircle, page: 'SalesMessages' },
      { name: 'Emails Marketing', icon: Send, page: 'EmailsMarketing' },
      { name: 'Publicité ADS', icon: Magnet, page: 'AdCopies', locked: true },
      { name: 'Réseaux sociaux', icon: Share2, page: 'SocialMedia', locked: true },
    ]
  },
  { name: 'Discuter avec Noah', icon: MessageCircle, page: 'NovaChat', locked: true },
  { name: 'Paramètres', icon: Settings, page: 'Settings' },
];

export default function Sidebar({ currentPage, progress = 0 }) {
  const [openFolders, setOpenFolders] = useState({ 'Ressources IA': true });

  const toggleFolder = (folderName) => {
    setOpenFolders(prev => ({ ...prev, [folderName]: !prev[folderName] }));
  };

  return (
    <aside className="w-72 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">PASSION IA</h1>
            <p className="text-xs text-gray-600">Générateur d'activité</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Progression globale</span>
          <span className="text-sm font-semibold text-[#61f7a2]">{progress}%</span>
        </div>
        <ProgressBar value={progress} max={100} size="sm" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuStructure.map((item) => {
          if (item.isFolder) {
            const isOpen = openFolders[item.name];
            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleFolder(item.name)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-blue-900/10 w-full transition-all"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1 font-medium text-left">{item.name}</span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
                </button>
                {isOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.items.map((subItem) => {
                      const isActive = currentPage === subItem.page;
                      return (
                        <Link
                          key={subItem.page}
                          to={createPageUrl(subItem.page)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm",
                            isActive 
                              ? "bg-[#61f7a2]/10 text-[#61f7a2] border border-[#61f7a2]/20" 
                              : "text-gray-600 hover:text-gray-900 hover:bg-blue-900/10"
                          )}
                        >
                          <subItem.icon className="w-4 h-4" />
                          <span className="flex-1 font-medium">{subItem.name}</span>
                          {subItem.locked && <Lock className="w-3 h-3 text-gray-500" />}
                          {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

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

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
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